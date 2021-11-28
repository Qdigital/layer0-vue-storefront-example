import { SearchQuery } from 'storefront-query-builder'

const productActions = {
  async findProductOption ({ dispatch }, { serverItem }) {
    if (serverItem.product_type === 'configurable') {
      let query = new SearchQuery()
      query = query.applyFilter({ key: 'configurable_children.sku', value: { eq: serverItem.sku } })

      const { items } = await dispatch(
        'product/findProducts',
        {
          query,
          start: 0,
          size: 1,
          options: {
            populateRequestCacheTags: false,
            prefetchGroupProducts: false,
            separateSelectedVariant: true
          }
        },
        { root: true }
      )

      return items.length >= 1 ? { sku: items[0].sku, childSku: serverItem.sku } : null
    }

    return { sku: serverItem.sku }
  },
  async getProductVariant ({ dispatch }, { serverItem }) {
    try {
      const options = await dispatch('findProductOption', { serverItem })
      const singleProduct = await dispatch('product/single', { options }, { root: true })

      return {
        ...singleProduct,
        server_item_id: serverItem.item_id,
        qty: serverItem.qty,
        server_cart_id: serverItem.quote_id,
        product_option: serverItem.product_option || singleProduct.product_option
      }
    } catch (e) {
      return null
    }
  }
}

export default productActions
