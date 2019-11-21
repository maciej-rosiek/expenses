import React from 'react';
import {Expense} from "./model";
import ReactTooltip from "react-tooltip";

export interface ExpensesByDayProps {
    expenses: Expense[]
}

export const ExpensesByDay = ({expenses}: ExpensesByDayProps) => {
    const expensesByDay: {day: string, expenses: Expense[]}[] = [];

    let previousDay: string | null = null;

    expenses.forEach(expense => {
        const day = formatDate(expense.date);

        if (previousDay == null || day !== previousDay) {
            previousDay = day;
            expensesByDay.push({day, expenses: []});
        }

        expensesByDay[expensesByDay.length - 1].expenses.push(expense);
    });

    return (
      <div>
          {expensesByDay.map(({day, expenses}) => (
              <div key={day} style={{marginBottom: 16}}>
                  <div style={{fontSize: "calc(10px + 1vmin)", marginBottom: 4}}>{day}</div>
                  <table style={{width: "100%", borderSpacing: 0}}>
                      <tbody>
                      {expenses.map((expense, index) =>
                          <tr key={index}>
                              <td style={{width: "10%", padding: 0, verticalAlign: "top"}}>{expense.author.substring(0, 1)}</td>
                              <td style={{width: "30%", padding: 0, verticalAlign: "top"}}>{expense.category}</td>
                              <td style={{width: "40%", padding: 0, verticalAlign: "top"}} data-for="expenses-by-day" data-tip={expense.message}>{expense.description}</td>
                              <td style={{width: "20%", padding: 0, verticalAlign: "top", textAlign: "right"}}>{expense.amount} €</td>
                          </tr>
                      )}
                      </tbody>
                  </table>
              </div>
          ))}
          <ReactTooltip id="expenses-by-day" />
      </div>
    );
};

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
