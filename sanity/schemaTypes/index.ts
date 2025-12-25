import { type SchemaTypeDefinition } from 'sanity'
import { productType } from './productType'
import { orderType } from './orderType'
import { customerType } from './customerType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [productType, orderType, customerType],
}