export type QueryBuilder = <Args extends Record<string, any>, Output>(config: {
  args: Args;
  handler: (ctx: any, args: any) => Promise<Output> | Output;
}) => any;

export type MutationBuilder = <Args extends Record<string, any>, Output>(config: {
  args: Args;
  handler: (ctx: any, args: any) => Promise<Output> | Output;
}) => any;

export const query: QueryBuilder = ((config: any) => config) as any;
export const mutation: MutationBuilder = ((config: any) => config) as any;
