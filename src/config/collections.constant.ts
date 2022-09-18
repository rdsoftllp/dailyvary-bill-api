export const CollectionNames = {
  USER: 'user',
  BILL: 'bill',
}
export const CollectionFields = {
  User: {
    name: 'name',
    phone: 'phone',
    pin: 'pin',
    email: 'email',
  },
  Bill: {
    customerName: 'customerName',
    customerAddress: 'customerAddress',
    customerPhone: 'customerPhone',
    createdBy: 'createdBy',
    date: 'date',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    serviceCharge: 'serviceCharge',
    total: 'total',
    discount: 'discount',
    discountText: 'discountText',
    items: 'items'
  },
  BillItems: {
    name: 'name',
    quantity: 'quantity',
    price: 'price',
  }
}
