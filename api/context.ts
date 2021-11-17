import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'

const db = new PrismaClient();

export interface User {
id: number;
email: string;
avatar?: string;
name?: string;
}

export interface Token {
  userId: number
  type: string
  timestamp: number
}

export interface Context {
  db: PrismaClient,
  user?: User
}

export function context(ctx: { req: { get: (arg0: string) => string; }; connection: { context: { Authorization: string; }; }; }):Context{
   
    let authorization = ctx.req.get('Authorization')
    let user;
      // specifically for subscriptions as the above will fail
      authorization = ctx?.connection?.context?.Authorization
    const bearerLength = "Bearer ".length
    let token = authorization.replace('Bearer ', '')
    if (authorization && authorization.length > bearerLength) {
        token = authorization.slice(bearerLength) 
    }
     jwt.verify(token, 'process.env.JWT_SECRET', (err: any, result: any) => {
        if (err) {
          throw new Error(err)
        } else {
          user = db.user.findOne({where:{id:result.id}})
        }
      })
    
  
  return { db ,user}
}