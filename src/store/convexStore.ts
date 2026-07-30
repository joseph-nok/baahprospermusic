import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Doc, Id } from '../../convex/_generated/dataModel'

const convexApi = api as any

export type EventItem = Doc<'upcomingEvent'> & {
  eventDate: number
  location: string
}
export type MusicItem = Doc<'music'>
export type GalleryItem = Doc<'galleries'>
export type TeamMember = Doc<'team'>

async function uploadFile(
  file: File,
  getUploadUrl: () => Promise<string>,
  getStorageUrl: (args: { storageId: string }) => Promise<string | null>,
  fieldName: string,
) {
  try {
    const uploadUrl = await getUploadUrl()
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })
    if (!response.ok) throw new Error('upload request rejected')
    const { storageId } = (await response.json()) as { storageId: string }
    if (!storageId) throw new Error('upload did not return a file ID')
    const url = await getStorageUrl({ storageId })
    if (!url) throw new Error('file URL was empty')
    return url
  } catch {
    throw new Error(
      `${fieldName} could not be uploaded. Please choose the file again and try once more.`,
    )
  }
}

const DEFAULT_EVENT: Omit<EventItem, '_id' | '_creationTime'> = {
  title: 'Baah Prosper Live in Accra: Songs of Redemption',
  // Keep the SSR placeholder deterministic so the admin page hydrates cleanly.
  dateIso: '2030-01-01T17:00:00.000Z',
  timeText: '5:00 PM',
  venue: 'Accra International Conference Centre',
  city: 'Accra',
  town: 'Ghana',
  eventDate: Date.parse('2030-01-01T17:00:00.000Z'),
  location: 'Accra International Conference Centre, Accra, Ghana',
  flyerStorageId:
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
}

export function useAdminEvent() {
  const event = useQuery(convexApi.adminOperations.getActiveEvent)
  const updateActiveEvent = useMutation(
    convexApi.adminOperations.updateActiveEvent,
  )

  const updateEvent = async (updated: {
    title: string
    eventDate: number
    location: string
    flyerStorageId?: string
  }) => {
    return await updateActiveEvent({
      title: updated.title,
      eventDate: updated.eventDate,
      location: updated.location,
      flyerStorageId: updated.flyerStorageId,
    })
  }

  return {
    event: event ?? {
      _id: 'placeholder' as Id<'upcomingEvent'>,
      _creationTime: Date.parse('2030-01-01T00:00:00.000Z'),
      ...DEFAULT_EVENT,
    },
    updateEvent,
    isLoading: event === undefined,
  }
}

export function useAdminMusic() {
  const musicList = useQuery(convexApi.adminOperations.getMusicItems)
  const createMusicItem = useMutation(convexApi.adminOperations.createMusicItem)
  const updateMusicItem = useMutation(convexApi.adminOperations.updateMusicItem)
  const deleteMusicItem = useMutation(convexApi.adminOperations.deleteMusicItem)
  const generateUploadUrlMutation = useMutation(
    convexApi.adminOperations.generateUploadUrl,
  )
  const getStorageUrlMutation = useMutation(
    convexApi.adminOperations.getStorageUrl,
  )

  const createItem = async (item: Omit<MusicItem, '_id' | '_creationTime'>) => {
    return await createMusicItem({
      title: item.title,
      lyrics: item.lyrics,
      youtubeUrl: item.youtubeUrl,
      thumbnail: item.thumbnail,
      audioUrl: item.audioUrl,
      category: item.category,
    })
  }

  const updateItem = async (
    id: Id<'music'>,
    updatedFields: Partial<Omit<MusicItem, '_id'>>,
  ) => {
    const existing = musicList?.find((item: MusicItem) => item._id === id)
    if (!existing) return

    await updateMusicItem({
      id,
      title: updatedFields.title ?? existing.title,
      lyrics: updatedFields.lyrics ?? existing.lyrics,
      youtubeUrl: updatedFields.youtubeUrl ?? existing.youtubeUrl,
      thumbnail: updatedFields.thumbnail ?? existing.thumbnail,
      audioUrl: updatedFields.audioUrl ?? existing.audioUrl,
      category: updatedFields.category ?? existing.category,
    })
  }

  const deleteItem = async (id: Id<'music'>) => {
    await deleteMusicItem({ id })
  }

  const generateUploadUrl = async () => {
    return await generateUploadUrlMutation({})
  }

  const uploadMusicFile = (file: File, fieldName = 'Song file') =>
    uploadFile(file, generateUploadUrl, getStorageUrlMutation, fieldName)

  return {
    musicList: musicList ?? [],
    createItem,
    updateItem,
    deleteItem,
    generateUploadUrl,
    uploadMusicFile,
    isLoading: musicList === undefined,
  }
}

export function useAdminGallery() {
  const galleries = useQuery(convexApi.adminOperations.getGalleries) ?? []
  const createGalleryMutation = useMutation(
    convexApi.adminOperations.createGallery,
  )
  const updateGalleryMutation = useMutation(
    convexApi.adminOperations.updateGallery,
  )
  const deleteGalleryMutation = useMutation(
    convexApi.adminOperations.deleteGallery,
  )
  const generateUploadUrlMutation = useMutation(
    convexApi.adminOperations.generateUploadUrl,
  )
  const getStorageUrlMutation = useMutation(
    convexApi.adminOperations.getStorageUrl,
  )

  const createGallery = async (
    item: Omit<GalleryItem, '_id' | '_creationTime'>,
  ) => {
    return await createGalleryMutation({
      eventTitle: item.eventTitle,
      coverImage: item.coverImage,
      images: item.images,
    })
  }

  const updateGallery = async (
    id: Id<'galleries'>,
    updatedFields: Partial<Omit<GalleryItem, '_id'>>,
  ) => {
    const existing = galleries.find((item: GalleryItem) => item._id === id)
    if (!existing) return

    await updateGalleryMutation({
      id,
      eventTitle: updatedFields.eventTitle ?? existing.eventTitle,
      coverImage: updatedFields.coverImage ?? existing.coverImage,
      images: updatedFields.images ?? existing.images,
    })
  }

  const deleteGallery = async (id: Id<'galleries'>) => {
    await deleteGalleryMutation({ id })
  }

  const uploadGalleryFile = async (file: File) => {
    const getUploadUrl = () => generateUploadUrlMutation({})
    return uploadFile(
      file,
      getUploadUrl,
      getStorageUrlMutation,
      'Gallery image',
    )
  }

  return {
    galleries,
    createGallery,
    updateGallery,
    deleteGallery,
    uploadGalleryFile,
  }
}

export function useAdminTeam() {
  const team = useQuery(convexApi.adminOperations.getTeam) ?? []
  const createTeamMemberMutation = useMutation(
    convexApi.adminOperations.createTeamMember,
  )
  const updateTeamMemberMutation = useMutation(
    convexApi.adminOperations.updateTeamMember,
  )
  const deleteTeamMemberMutation = useMutation(
    convexApi.adminOperations.deleteTeamMember,
  )
  const generateUploadUrlMutation = useMutation(
    convexApi.adminOperations.generateUploadUrl,
  )
  const getStorageUrlMutation = useMutation(
    convexApi.adminOperations.getStorageUrl,
  )

  const createMember = async (
    member: Omit<TeamMember, '_id' | '_creationTime'>,
  ) => {
    return await createTeamMemberMutation({
      name: member.name,
      role: member.role,
      description: member.description,
      avatarUrl: member.avatarUrl,
      tiktok: member.tiktok,
      x: member.x,
      youtube: member.youtube,
      ig: member.ig,
    })
  }

  const updateMember = async (
    id: Id<'team'>,
    updatedFields: Partial<Omit<TeamMember, '_id'>>,
  ) => {
    const existing = team.find((member: TeamMember) => member._id === id)
    if (!existing) return

    await updateTeamMemberMutation({
      id,
      name: updatedFields.name ?? existing.name,
      role: updatedFields.role ?? existing.role,
      description: updatedFields.description ?? existing.description,
      avatarUrl: updatedFields.avatarUrl ?? existing.avatarUrl,
      tiktok: updatedFields.tiktok ?? existing.tiktok,
      x: updatedFields.x ?? existing.x,
      youtube: updatedFields.youtube ?? existing.youtube,
      ig: updatedFields.ig ?? existing.ig,
    })
  }

  const deleteMember = async (id: Id<'team'>) => {
    await deleteTeamMemberMutation({ id })
  }

  const uploadTeamFile = async (file: File) => {
    const getUploadUrl = () => generateUploadUrlMutation({})
    return uploadFile(file, getUploadUrl, getStorageUrlMutation, 'Avatar photo')
  }

  return { team, createMember, updateMember, deleteMember, uploadTeamFile }
}
