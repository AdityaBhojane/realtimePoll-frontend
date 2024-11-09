import { useEffect, useState } from 'react';
import axios from 'axios';
import socket from './socket';

function App() {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [polls, setPolls] = useState([]);
    const [currentPoll, setCurrentPoll] = useState(null);

    useEffect(() => {
        axios.get(import.meta.env.VITE_API).then(res => setPolls(res.data));
        socket.on('newPoll', poll => setCurrentPoll(poll));
        socket.on('pollEnded', poll => setPolls([...polls, poll]));
        socket.on('voteUpdate', poll => setCurrentPoll(poll));
    }, [polls]);

    const launchPoll = () => {
        const pollData = { question, options: options.map(opt => ({ option: opt, votes: 0 })) };
        socket.emit('launchPoll', pollData);
        setQuestion('');
        setOptions(['', '']);
    };

    const endPoll = () => {
        if (currentPoll) {
            socket.emit('endPoll', currentPoll._id);
        }
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const castVote = (optionIndex) => {
        socket.emit('vote', { pollId: currentPoll._id, optionIndex });
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Realtime Poll App <span className='font-thin text-sm'>(simple app with no extra checks and auth)</span> </h1>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Poll question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="border p-2 mr-2"
                />
                {options.map((opt, idx) => (
                    <input
                        key={idx}
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                            const newOptions = [...options];
                            newOptions[idx] = e.target.value;
                            setOptions(newOptions);
                        }}
                        className="border p-2 mr-2 mt-2"
                    />
                ))}
                <button onClick={addOption} className="bg-green-500 text-white p-2 rounded mt-2">Add Option</button>
                <button onClick={launchPoll} className="bg-blue-500 text-white p-2 rounded mt-2 ml-2">Launch Poll</button>
            </div>
            {currentPoll && currentPoll.isActive && (
                <div className="mb-4 flex flex-col">
                    <h2 className="text-2xl">Q. {currentPoll.question}</h2>
                    {currentPoll.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => castVote(idx)}
                            className="border p-2 mr-2 mt-2 w-1/2 rounded-full"
                        >
                            {opt.option} - {opt.votes} votes
                        </button>
                    ))}
                    <button onClick={endPoll} className="bg-red-800 text-white p-2 mt-4 w-1/2 rounded-full">End Poll</button>
                </div>
            )}
            <div className=''>
                <h2 className="text-xl font-semibold">Past Polls Result :</h2>
                {polls.map((poll, idx) => (
                    <div key={idx} className='my-5 border border-[#ccc] p-5 w-1/3 rounded-lg '>
                        <h3 className='font-bold'>{poll.question}</h3>
                        {poll.options.map((opt, idx) => (
                            <div key={idx} className='flex justify-between w-full bg-slate-500 my-2 p-2 px-5 rounded-full'>
                              <p >{opt.option}:</p>
                              <p> {opt.votes} votes</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
