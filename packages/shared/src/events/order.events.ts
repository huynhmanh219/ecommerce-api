export class OrderCreatedEvent{
    orderId:string;
    userId:string;
    items:OrderItem[];
    totalPrice:number;
    shippingAddress:string;
    timestamp:Date;
}

export class OrderItem{
    productId:string;
    quantity:number;
    price:number;
}

export class OrderCancelledEvent{
    orderId:string;
    reason:string;
    timestamp:Date;
}

export class OrderShippedEvent{
    orderId:string;
    trackingNumber:string;
    timestamp:Date;
}

export interface PaymentcompletedEvent{
    orderId:string;
    paymentId:string;
    amount:number;
    timestamp:Date;
}

export interface PaymentFailedEvent{
    orderId:string;
    reason:string;
    timestamp:Date;
}