module.exports = {
  AUTH: {
    JWT: {
      ISS: 'monarcsoft.com',
    },
  },

  STATUS: {
    DRAFT: 'draft',
    FOR_APPROVAL: 'for_approval',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
    PENDING: 'pending',
    DELETED: 'deleted',
    IN_STOCK: 'in_stock',
    NO_STOCK: 'no_stock',
    ASSIGNED: 'assigned',
    BARCODED: 'barcoded',
    PRE_TREATED: 'pre_treated',
    PRINTED: 'printed',
    QA_PASSED: 'qa_passed',
    BINNED: 'binned',
    SHIPPED: 'shipped',
  },

  ELASTICSEARCH: {
    PRODUCTS_INDEX: 'products',
    ITEMS_INDEX: 'items',
    DESIGNS_INDEX: 'designs',
  },

  ELASTICSEARCH_SYNC_STATUS: {
    OUTDATED: 'outdated',
    SYNCING: 'syncing',
    DELETE: 'delete',
    DELETING: 'deleting',
    LATEST: 'latest',
  },

  ELASTICSEARCH_ACTIONS: {
    UPDATE_INDEX: 'update_index',
    DELETE_INDEX: 'delete_index',
  },

  ELASTICSEARCH_SORT: {
    POPULARITY: 'popularity',
    PRICE: 'price',
    DATE: 'date',
  },

  PRINTING_METHODS: {
    DIGITAL: 'digital',
    EMBROIDERY: 'embroidery',
    VINYL: 'vinyl',
    SUBLIMATION: 'sublimation',
  },

  BIN_STATUS: {
    EMPTY: 'empty',
    WAITING: 'waiting',
    READY: 'ready',
    NOT_BINNED: 'not_binned',
    BINNED: 'binned',
    SEND_TO_BOXING: 'send_to_boxing',
  },

  BIN_ACTIONS: {
    ITEM_ADDED: 'item_added',
    ITEM_REMOVED: 'item_removed',
  },
}
