export interface PaymentMethod {
    name: string,
    exp_month: number,
    exp_year: number,
    last4: string,
    brand: string,
    isDefault: boolean
}
