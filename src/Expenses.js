import React, {useState} from 'react';
import './Expenses.css';

function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function daysDifference(date1, date2) {
    const timeDiff = date2.getTime() - date1.getTime();
    return  timeDiff / (1000 * 3600 * 24);
}

function getCalendarWeek(date) {
    const onejan = new Date(date.getFullYear(), 0, 1);
    const millisecsInDay = 86400000;
    return Math.ceil((((date - onejan) /millisecsInDay) + onejan.getDay()+1)/7);
}

export const Expenses = ({expenses}) => {
    const [daysFilter, setDaysFilter] = useState(localStorage.getItem('days-filter') || '30-days');

    const filteredExpenses = expenses.filter(expense => {
       if (daysFilter === '30-days') {
           return daysDifference(expense.date, new Date()) <= 30;
       } else if (daysFilter === '7-days') {
           return daysDifference(expense.date, new Date()) <= 7;
       }  else if (daysFilter === 'current-week') {
           return getCalendarWeek(expense.date) === getCalendarWeek(new Date());
       } else if (daysFilter === 'current-month') {
           return expense.date.getMonth() === new Date().getMonth() && expense.date.getMonth() === new Date().getMonth();
       } else {
           return true;
       }
    });

    let sum = 0;
    const personSum = {};

    filteredExpenses.forEach(expense => {
        sum += expense.amount;
        personSum[expense.author] = (personSum[expense.author] || 0) + expense.amount;
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

            <hr />

            <div>Sum: {sum.toFixed(2)}€</div>

            {Object.keys(personSum).map(person => (
                <div key={person}>{person}: {personSum[person].toFixed(2)}€</div>
            ))}

            <hr />

            {filteredExpenses.map((expense, index) =>
                <div key={index} title={expense.message}>
                    {formatDate(expense.date)} | {expense.author} | {expense.amount}€ | {expense.description}
                </div>
            )}
        </div>
    );
};
