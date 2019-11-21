export interface Expense {
    date: Date
    amount: number
    description: string
    author: string
    message: string
    category?: string
}

export interface Category {
    name: string
    words: string[]
}
