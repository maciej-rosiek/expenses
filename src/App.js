import React, {useEffect, useState} from 'react';
import './App.css';
import {useDropzone} from 'react-dropzone';
import * as WhatsApp from 'whatsapp-chat-parser';
import {Expenses} from "./Expenses";

function hasNumber(str) {
    return /\d/.test(str);
}

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsText(file);
    })
}

function sortByDate(a, b) {
    return b.date - a.date;
}

const numbersRegex = /(^(\d|\.|,)+)(.*)/i;

const fluffMessages = [
    '115 euro!'
];

function App() {
    const [expenses, setExpenses] = useState(undefined);

    const onMessages = async contents => {
        const messages = await WhatsApp.parseString(contents);
        console.log("Got messages", messages);

        return messages.map(message => {
            message.amount = parseFloat(message.message.replace(numbersRegex, '$1').replace(",", "."));
            message.description = message.message.replace(numbersRegex, '$3').trim();
            return message;
        }).filter(message =>
            message.message &&
            message.message.trim() !== '' &&
            hasNumber(message.message) &&
            message.author !== 'System' &&
            message.amount &&
            !fluffMessages.find(m => m.indexOf(message.message) >= 0)
        );
    };

    useEffect(() => {
        const previousExpensesString = localStorage.getItem('previous-expenses');
        if (previousExpensesString) {
            (async () => {
                try {
                    let previousExpenses = JSON.parse(previousExpensesString);
                    previousExpenses = previousExpenses.map(e => ({
                        ...e,
                        date: new Date(e.date)
                    }));
                    setExpenses(previousExpenses);
                } catch (e) {
                    console.log("Could not load previous expenses", e);
                    localStorage.removeItem('previous-expenses');
                }
            })();
        }
        // eslint-disable-next-line
    }, []);

    const onDrop = async files => {
        setExpenses(undefined);
        const allExpenses = (await Promise.all(files.map(async file => {
            const contents = await readFileAsync(file);
            return await onMessages(contents);
        }))).flat().sort(sortByDate);

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
                    <div>
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
                        <Expenses expenses={expenses}/>
                    </div>)}
            </header>
        </div>
    );
}

export default App;
