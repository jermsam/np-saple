// api/schema.ts
import { makeSchema } from 'nexus'
import { join } from 'path'
import * as types from './graphql'
export const schema = makeSchema({
  types,
  outputs: {
      // Output path to where nexus should write the generated 
      // TypeScript definition types derived from your schema.
    typegen: join(__dirname, '..', 'nexus-typegen.ts'), 
    // Output path to where nexus should write the 
    // SDL version of your GraphQL schema.
    schema: join(__dirname, '..', 'schema.graphql'), // 3
  },
  // configure Nexus to know the type of our GraphQL context 
   contextType: {
        module: join(__dirname, '.', 'context.ts'),
        export: 'Context'
    }
})