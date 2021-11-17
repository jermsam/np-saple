import { objectType,nonNull,extendType,stringArg,nullable,intArg} from 'nexus'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const User = objectType({
  name: 'User',   
  definition(t) {
    t.int('id')            
    t.nonNull.string('email')      
    t.nullable.string('password') 
    t.nullable.string('name')
    t.nullable.string('avatar')
  },
})

export const AuthUser = objectType({
  name: 'AuthUser',   
  definition(t) {       
     t.field('user', {
        // create a non-null list of non-null friends
        // using typegen type referencing
        type: 'User',
      })
    t.nullable.string('token')
  },
})

export const UserMutations = extendType({
  type: 'Mutation',                         
  definition(t) {
    t.nonNull.field('userLogin', {    
      type: 'AuthUser', 
       args: {                                        // 1
        email: nonNull(stringArg()),                 // 2
        password: nonNull(stringArg()),                  // 2
      }, 
      async resolve(_root, args, ctx){
        try{
            const {password, ...user} = await ctx.db.user.findOne({
                where:{email:args.email}
            })
            const validpass = await bcrypt.compareSync(args.password, password)
            if (validpass) {
            const token = jwt.sign(user, 'process.env.JWT_SECRET',{
               algorithm: 'HS256',
               subject: user.id,
               expiresIn:'1d'
            })
            return { user,token,}
            }
            return null;
        }catch(error){
            console.log(error)
            throw new Error(`${error}`)
        }
      }               
    })
     t.nonNull.field('userRegistration', {    
      type: 'AuthUser', 
       args: {                                        // 1
        email: nonNull(stringArg()),                 // 2
        password: nonNull(stringArg()),                  // 2
      },   
       async resolve(_root, args, ctx){
        try{
            const existingUser = await ctx.db.user.findOne({
                where:{email:args.email}
            })
             if (existingUser) {
                throw new Error("ERROR: Username already used.")
            }
            const  hash = bcrypt.hashSync(args.password, 10)
            const data = {
                email: args.email,
                password: hash
                }
            const { password, ...user } = await ctx.db.user.create({data})
            const token = jwt.sign(user, 'process.env.JWT_SECRET',{
               algorithm: 'HS256',
               subject: user.id,
               expiresIn:'1d'
            })
            return { user,token,}
        }catch(error){
            console.log(error)
            throw new Error(`${error}`)
        }
      }             
    })
  },
})


export const UserQuery = extendType({
    type: 'Query',
    definition(t){
      t.field('user', {
            type: nullable('User'),
             args: {
                id: nonNull(intArg())
            },
            resolve(_root, _args, ctx){
                return ctx.db.user.findOne({where:{id:args.id}})
            }
        })
         t.field('viewer', {
            type: nullable('User'),
            resolve(_root, _args, ctx){
                return ctx.user
            }
        })
         
    }
});