import {Category, Expense} from "./model";

export const categories: Category[] = [{
    name: "Jedzenie",
    words: ["rewe", "lidl", "obiad", "batonik", "gumy", "netto", "milky", "dm", "kaufland", "pizza", "woda", "apteka", "chleb"]
}, {
    name: "Ubrania",
    words: ["zalando", "rękawiczki", "zara", "ubrania"]
}, {
    name: "Komunikacja",
    words: ["paliwo", "bilety", "bvg", "bilet"]
}, {
    name: "Hobby",
    words: ["flamastry", "basteln", "basen", "prezent", "lego", "wyjście", "papierniczy"]
}, {
    name: "Inne",
    words: ["edyta", "licencja"]
}];


export function categorize(expense: Expense): Expense {
    let matchingCategory = categories.find(c => c.words.filter(w => expense.message.toLowerCase().indexOf(w.toLowerCase()) >= 0).length > 0);
    let category = matchingCategory ? matchingCategory.name : undefined;

    if (!category) {
        console.log("Expense without category: ", expense);
        category = "Inne"
    }

    return {
        ...expense,
        category
    }
}