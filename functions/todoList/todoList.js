const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require("faunadb");
const q = faunadb.query;
require("dotenv").config()
const typeDefs = gql`
  type Query {
    todos: [Todo!]!
  }
  type Mutation {
    addTodo(task: String!) : Todo
    deleteTodo(id: String!): Todo
    updateTodo(id:String! , task:String!) : Todo
  }
  type Todo {
    id: ID!
    task: String
    status: Boolean
  }
`;



const resolvers = {
  Query: {
    todos: async (root, args, context) => {
      try {
        var client = new faunadb.Client({
          secret: 'fnAEENqHQIACAau-csSiEX9azXbG3uOhHirP10Lt',
        });
        const result = await client.query(
          q.Map(
            q.Paginate(q.Documents(q.Index("task"))),
            q.Lambda((x) => q.Get(x))
          )
        );
        return result.data.map((item) => {
          return {
            id: item.ref.id,
            task: item.data.task,
            status: item.data.status,
          };
        });
      } catch (err) {
        console.log(`ERROR ${err}`);
      }
    },
  },

  Mutation: {
    addTodo: async (_, { task }) => {
      try {
        var client = new faunadb.Client({
          // secret: process.env.FAUNDDB_SECRET_KEY,
          secret: 'fnAEENqHQIACAau-csSiEX9azXbG3uOhHirP10Lt',
        });
        const result = await client.query(
          q.Create(q.Collection("todos"), {
            data: {
              task: task,
              status: true,
            },
          })
        );
      } catch (err) {
        console.log(`ERROR ${err}`);
      }
    },

    // delete todo
    deleteTodo: async (_, { id }) => {
      // console.log("IDDDDDDD", id);
      try {

        var client = new faunadb.Client({
          //secret: process.env.FAUNDDB_SECRET_KEY,
          secret: 'fnAEENqHQIACAau-csSiEX9azXbG3uOhHirP10Lt',
        });

        const result = await client.query(
          q.Delete(q.Ref(q.Collection("todos"), id))
        )

        // console.log("DELETE_RESULT ||||", result);
        return {
          task: result.data.task,
          id: result.data.id,
        };
        // return result
      } catch (err) {
        console.log(`ERROR ||| ${err}`);
      }
    },

    updateTodo: async (_, { id, task }) => {
      try {
        var client = new faunadb.Client({
          //secret: process.env.FAUNDDB_SECRET_KEY,
          secret: 'fnAEENqHQIACAau-csSiEX9azXbG3uOhHirP10Lt',
        });
        const result = await client.query(
          q.Update(q.Ref(q.Collection("todos"), id), {
            data: {
              task: task
            }
          })
        )
        return {
          task: result.data.task,
          id: result.data.id
        }
      }
      catch (err) {
        console.log(`error ${err}`)
      }
    }

  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = server.createHandler({

});

module.exports = { handler }