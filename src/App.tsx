import './App.css';
import {useDropzone} from 'react-dropzone';
import * as WhatsApp from 'whatsapp-chat-parser';
import {Expenses} from "./Expenses";
import {useEffect, useState} from "react";
import * as React from "react";
import {Expense} from "./model";
import {categorize} from "./categories";

function hasNumber(str: string) {
    return /\d/.test(str);
}

function readFileAsync(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result as string);
        };

        reader.onerror = reject;

        reader.readAsText(file);
    })
}

function sortByDate(a: Expense, b: Expense) {
    return b.date.getTime() - a.date.getTime();
}

const numbersRegex = /(^(\d|\.|,)+)(.*)/i;

function App() {
    const [expenses, setExpenses] = useState<Expense[] | undefined>(undefined);

    const onMessages = async (contents: string): Promise<Expense[]> => {
        const messages = await WhatsApp.parseString(contents);
        console.log("Got messages", messages);

        return messages.map<Expense>(message => {
            return {
                ...message,
                amount: parseFloat(message.message.replace(numbersRegex, '$1').replace(",", ".")),
                description: message.message.replace(numbersRegex, '$3').trim()
            }
        }).filter(expense =>
            expense.message &&
            expense.message.trim() !== '' &&
            hasNumber(expense.message) &&
            expense.author !== 'System' &&
            expense.amount
        );
    };

    useEffect(() => {
        const previousExpensesString = localStorage.getItem('previous-expenses');
        if (previousExpensesString) {
            (async () => {
                try {
                    let previousExpenses = (JSON.parse(previousExpensesString) as any[]).map(e => ({
                        ...e,
                        date: new Date(e.date)
                    })) as Expense[];
                    setExpenses(previousExpenses);
                } catch (e) {
                    console.log("Could not load previous expenses", e);
                    localStorage.removeItem('previous-expenses');
                }
            })();
        }
        // eslint-disable-next-line
    }, []);

    const onDrop = async (files: File[]) => {
        setExpenses(undefined);
        const allExpenses = flatMap((await Promise.all(files.map(async file => {
            const contents = await readFileAsync(file);
            return onMessages(contents);
        })))).sort(sortByDate);

        console.log("Got expenses: ", allExpenses);

        setExpenses(allExpenses);
        localStorage.setItem('previous-expenses', JSON.stringify(allExpenses));
    };

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

    return (
        <div className="App">
            <header className="App-header">
                {!expenses &&
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <p>Drop the files here ...</p> :
                            <p>Drag 'n' drop some files here, or click to select files</p>
                    }
                </div>
                }
                {expenses && (
                    <div style={{width: "100%", maxWidth: 800}}>
                        <div className="App-clear-button-container">
                            <button className="App-clear-button"
                                    onClick={() => {
                                        setExpenses(undefined);
                                        localStorage.removeItem('previous-expenses');
                                    }}>
                                Clear
                            </button>
                        </div>
                        <hr/>
                        <Expenses expenses={expenses.map(categorize)}/>
                    </div>)}
            </header>
        </div>
    );
}

export function flatMap<T>(array: T[][]): T[] {
    return Array.prototype.concat(...array);
}

export default App;
