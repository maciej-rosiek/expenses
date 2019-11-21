import {useState} from 'react';
import './Expenses.css';
import * as React from "react";
import {Expense} from "./model";
import {categories} from "./categories";
import ReactTooltip from "react-tooltip";
import {ExpensesByDay} from "./ExpensesByDay";

function daysDifference(date1: Date, date2: Date) {
    const timeDiff = date2.getTime() - date1.getTime();
    return timeDiff / (1000 * 3600 * 24);
}

function getCalendarWeek(date: Date) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const msInDay = 86400000;
    return Math.ceil((((date.getTime() - oneJan.getTime()) / msInDay) + oneJan.getDay() + 1) / 7);
}

export const Expenses = ({expenses}: {expenses: Expense[]}) => {
    const [daysFilter, setDaysFilter] = useState(localStorage.getItem('days-filter') || '30-days');
    const [selectedCategory, setSelectedCategory] = useState();

    const filteredExpenses = expenses.filter(expense => {
        if (daysFilter === '30-days') {
            return daysDifference(expense.date, new Date()) <= 30;
        } else if (daysFilter === '7-days') {
            return daysDifference(expense.date, new Date()) <= 7;
        } else if (daysFilter === 'current-week') {
            return getCalendarWeek(expense.date) === getCalendarWeek(new Date());
        } else if (daysFilter === 'current-month') {
            return expense.date.getMonth() === new Date().getMonth() && expense.date.getMonth() === new Date().getMonth();
        } else {
            return true;
        }
    });

    let sum = 0;
    const personSum: {[author: string]: number} = {};

    filteredExpenses.forEach(expense => {
        sum += expense.amount;
        personSum[expense.author] = (personSum[expense.author] || 0) + expense.amount;
    });

    const categoryExpenses: {[category: string]: {amount: number, expenses: Expense[]}} = {};
    filteredExpenses.forEach(expense => {
        const category = expense.category;
        if (category) {
            let entry = categoryExpenses[category];
            if (entry) {
                entry.amount = entry.amount + expense.amount;
                entry.expenses.push(expense);
                categoryExpenses[category] = entry;
            } else {
                categoryExpenses[category] = {amount: expense.amount, expenses: [expense]};
            }
        }
    });

    const onSelectCategoryExpenses = (category: string) => {
        if (selectedCategory === category) {
            setSelectedCategory(undefined);
        } else {
            setSelectedCategory(category);
        }
    };

    return (
        <div className="Expenses">
            <form>
                <div className="radio">
                    <label>
                        <input type="radio" value="option1" checked={daysFilter === '30-days'} onChange={() => {
                            setDaysFilter('30-days');
                            localStorage.setItem('days-filter', '30-days');
                        }}/>
                        30 days
                    </label>
                </div>
                <div className="radio">
                    <label>
                        <input type="radio" value="option1" checked={daysFilter === '7-days'} onChange={() => {
                            setDaysFilter('7-days');
                            localStorage.setItem('days-filter', '7-days');
                        }}/>
                        7 days
                    </label>
                </div>
                <div className="radio">
                    <label>
                        <input type="radio" value="option1" checked={daysFilter === 'current-week'} onChange={() => {
                            setDaysFilter('current-week');
                            localStorage.setItem('days-filter', 'current-week');
                        }}/>
                        Current Week
                    </label>
                </div>
                <div className="radio">
                    <label>
                        <input type="radio" value="option2" checked={daysFilter === 'current-month'} onChange={() => {
                            setDaysFilter('current-month');
                            localStorage.setItem('days-filter', 'current-month');
                        }}/>
                        Current Month
                    </label>
                </div>
                <div className="radio">
                    <label>
                        <input type="radio" value="option2" checked={daysFilter === 'all'} onChange={() => {
                            setDaysFilter('all');
                            localStorage.setItem('days-filter', 'all');
                        }}/>
                        All
                    </label>
                </div>
            </form>

            <hr/>

            <table style={{width: "100%", borderSpacing: 0}}>
                <tbody>
                    <tr>
                        <td style={{width: "60%", padding: 0, verticalAlign: "top"}}>Sum</td>
                        <td style={{width: "40%", padding: 0, verticalAlign: "top", textAlign: "right"}}>{sum.toFixed(2)} €</td>
                    </tr>
                    {Object.keys(personSum).map(person => (
                        <tr key={person}>
                            <td style={{width: "60%", padding: 0, verticalAlign: "top"}}>{person}</td>
                            <td style={{width: "40%", padding: 0, verticalAlign: "top", textAlign: "right"}}>{personSum[person].toFixed(2)} €</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr/>

            <table style={{width: "100%", borderSpacing: 0}}>
                <tbody>
                    {categories.map(category => (
                        <tr key={category.name}>
                            <td style={{width: "60%", padding: 0, verticalAlign: "top"}} data-for="expenses" data-tip={category.words.join(", ")}>{category.name}</td>
                            <td style={{width: "40%", padding: 0, verticalAlign: "top", textAlign: "right", color: category.name === selectedCategory ? 'lightblue': undefined}} onClick={() => onSelectCategoryExpenses(category.name)}>{(categoryExpenses[category.name] ? categoryExpenses[category.name].amount : 0).toFixed(2)} €</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr />

            <ExpensesByDay expenses={selectedCategory ? (categoryExpenses[selectedCategory] ? categoryExpenses[selectedCategory].expenses : []) : filteredExpenses} />

            <ReactTooltip id="expenses" />
        </div>
    );
};
