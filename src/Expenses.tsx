import {useState} from 'react';
import './Expenses.css';
import * as React from "react";
import {Expense} from "./model";

function formatDate(date: Date): string {
    let d = date,
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

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

    const expensesByDay: {day: string, expenses: Expense[]}[] = [];

    let previousDay: string | null = null;

    filteredExpenses.forEach(expense => {
        const day = formatDate(expense.date);

        if (previousDay == null || day !== previousDay) {
            previousDay = day;
            expensesByDay.push({day, expenses: []});
        }

        expensesByDay[expensesByDay.length - 1].expenses.push(expense);
    });

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

            <div>Sum: {sum.toFixed(2)}€</div>

            {Object.keys(personSum).map(person => (
                <div key={person}>{person}: {personSum[person].toFixed(2)}€</div>
            ))}

            <hr/>

            {expensesByDay.map(({day, expenses}) => (
                <div key={day} style={{marginBottom: 16}}>
                    <div style={{fontSize: "calc(10px + 1vmin)", marginBottom: 4}}>{day}</div>
                    <table style={{width: "100%", borderSpacing: 0}}>
                        {expenses.map((expense, index) =>
                            <tr key={index} title={expense.message}>
                                <td style={{width: "30%", padding: 0, verticalAlign: "top"}}>{expense.author}</td>
                                <td style={{width: "20%", padding: 0, verticalAlign: "top"}}>{expense.amount}</td>
                                <td style={{width: "50%", padding: 0, verticalAlign: "top"}}>{expense.description}</td>
                            </tr>
                        )}
                    </table>
                </div>
            ))}
        </div>
    );
};
