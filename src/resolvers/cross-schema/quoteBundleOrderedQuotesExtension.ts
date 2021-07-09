
import { visit, Kind, visitWithTypeInfo, TypeInfo, GraphQLSchema } from "graphql"
import { SchemaIdentifier, CrossSchemaExtension } from "./index"

const AddFieldToDelegatedRequest = (schema: GraphQLSchema, typeName: string, fieldName: string) => {
  const typeInfo = new TypeInfo(schema);
  const transformFxn = (originalRequest: any) => {
    const doc = visit(originalRequest.document, visitWithTypeInfo(typeInfo, {
      [Kind.SELECTION_SET]: (node) => {
        const parentType = typeInfo.getParentType();
        if (parentType && parentType.name === typeName) {
          const selections = [...node.selections];
          if (!selections.find(s => s.kind == "Field" && s.name.value === fieldName)) {
            selections.push({ kind: Kind.FIELD, name: { kind: Kind.NAME, value: fieldName } });
          }
          return { ...node, selections };
        }
        return node;
      },
    }));
    return { ...originalRequest, document: doc };
  };
  return transformFxn;
};

interface Quote {
  typeOfContract: String
}

interface QuoteBundle {
  quotes: Quote[]
}

export const createQuoteBundleOrderedQuotesExtension = (): CrossSchemaExtension => ({
  dependencies: [SchemaIdentifier.UNDERWRITER],
  content: null,
  resolvers: (schemas) => ({
    Query: {
      quoteBundle: {
        resolve: (
          _, args, context, info
        ) => {

          return info.mergeInfo.delegateToSchema({
            schema: schemas(SchemaIdentifier.UNDERWRITER),
            operation: 'query',
            fieldName: 'quoteBundle',
            args: args,
            context,
            info,
            transforms: [
              {
                transformRequest: AddFieldToDelegatedRequest(schemas(SchemaIdentifier.UNDERWRITER), "BundledQuote", "typeOfContract")
              }
            ]
          }).then((quoteBundle: QuoteBundle) => {
            const priority = (quote: Quote): number =>
              quote.typeOfContract.includes('HOME_CONTENT') ? 0
              : quote.typeOfContract.includes('ACCIDENT') ? 1
              : 2
            const sortedBundle = {
              ...quoteBundle, quotes: quoteBundle.quotes.sort((quoteA, quoteB) => {
                return priority(quoteA) - priority(quoteB)
              })
            }

            return sortedBundle
          })


        }
      }
    }
  })
})