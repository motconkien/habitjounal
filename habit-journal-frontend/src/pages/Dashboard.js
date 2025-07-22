import axios from "axios";
import React, { useEffect, useState } from "react";
import API from "../api";
import { LineChart } from "@mui/x-charts";
import { gettimeline } from "../components/utils"
import Checkbox from "@mui/material/Checkbox";
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link } from "react-router-dom";


export default function Dashboard() {
    const [weatherData, setWeatherData] = useState();
    const [quote, setQuote] = useState();
    const [journals, setJournals] = useState([]);
    const [xAxisDays, setXAxisDays] = useState([]);
    const [moodDataFilled, setMoodDataFilled] = useState([]);
    const [moodSeries, setMoodSeries] = useState([]);
    const [taskData, setTaskData] = useState([]);
    const [filtertask, setFilterTask] = useState([]);
    const [numbertask, setNumbertask] = useState();
    const [habitData, setHabitData] = useState([]);
    const [dailyhabit, setDailyHabit] = useState();
    const [weeklyhabit, setWeeklyHabit] = useState();
    const [monthlyhabit, setMonthlyHabit] = useState();
    const [groupedHabits, setGroupedHabits] = useState({});
    const [progress, setProgress] = useState(0);



    const numericToMoodLabel = {
        "happy": 9,
        "fun": 8,
        "productive": 7,
        "calm": 6,
        "bored": 5,
        "tired": 4,
        "anxious": 3,
        "fearful": 2,
        "sad": 1,
        "angry": 0,
    };

    const moodLabelFromValue = {
        9: "😄",     // happy
        8: "🎉",     // fun
        7: "🚀",     // productive
        6: "😌",     // calm
        5: "😐",     // bored
        4: "😩",     // tired
        3: "😟",     // anxious
        2: "😨",     // fearful
        1: "😢",     // sad
        0: "😠",     // angry
    };
    const fetchWeatherData = async () => {
        try {
            const res = await axios.get('https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=3d5acf28a4624bd732ea8112448fa98a&units=metric')
            // console.log(res.data)
            localStorage.setItem("lastWeatherFetch", new Date().toLocaleTimeString())
            localStorage.setItem("weatherdata", JSON.stringify(res.data));
            setWeatherData(res.data)
        } catch (err) {
            console.log("Error when fetching")
        }
    }

    const fetchQuote = async () => {
        try {
            const res = await API.get("quotes/");
            setQuote({ q: res.data.q, a: res.data.a });
            localStorage.setItem("quotetoday", JSON.stringify({ q: res.data.q, a: res.data.a }));
            console.log({ q: res.data.q, a: res.data.a })
        } catch (err) {
            console.log("Erro when fetching", err);
        }
    };
    // fetchQuote();
    useEffect(() => {

        const today = new Date().toDateString()
        const lastfetch = localStorage.getItem("lastWeatherFetch")
        if (today !== lastfetch) {
            fetchWeatherData();
            fetchQuote();
        }
        else {
            console.log("Data is fetch today");
            const savedData = localStorage.getItem("weatherdata");
            if (savedData) {
                setWeatherData(JSON.parse(savedData));
                // console.log("Raw data from localStorage:", localStorage.getItem("weatherdata"));
                // console.log("Parsed data:", JSON.parse(localStorage.getItem("weatherdata")));
            }

            const saveQuote = localStorage.getItem("quotetoday");
            if (saveQuote)
                setQuote(JSON.parse(saveQuote));
        }
    }, [])


    const fetchJournals = async () => {
        try {
            const res = await API.get('journal/');
            setJournals(res.data);
        } catch (err) {
            console.error('Error fetching journals:', err);
        }
    };

    const fetchTaskData = async () => {
        try {
            const res = await API.get('todo/tasks/');
            setTaskData(res.data)
            // console.log("Task data: ", res.data)
        } catch (err) {
            console.error("Fail to fetch data: ", err);
            alert('Failed to fetch data. Please reload page.')
        }
    }

    const fetchHabitData = async () => {
        try {
            const res = await API.get('habit/');
            // console.log("Habit: ", res.data)
            setHabitData(res.data)
        } catch (err) {
            console.error('Error fetching habit:', err);
        }
    }

    useEffect(() => {
        fetchHabitData();
        fetchJournals();
        fetchTaskData();
        const intervalId = setInterval(() => {
            fetchJournals();
            fetchTaskData();
            fetchHabitData();

        }, 500);

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, []);

    //when journals changes => mood data filled changes 
    useEffect(() => {
        if (!journals.length) return;

        const timeline = gettimeline();
        setXAxisDays(timeline);

        const moodData = [...journals]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(journal => ({
                x: journal.date,
                y: numericToMoodLabel[journal.mood],
            }));

        const filled = timeline.map(date => {
            const found = moodData.find(entry => entry.x === date);
            return { x: date, y: found ? found.y : 4 }; // 4 = neutral
        });

        setMoodDataFilled(filled);
    }, [journals]);

    // when mood data filled changes => the series changes
    useEffect(() => {
        if (!moodDataFilled.length) return;
        const series = moodDataFilled.map(item => item.y);
        setMoodSeries(series);
    }, [moodDataFilled]);

    // when taskdata changes => filterdata change 
    useEffect(() => {
        if (!taskData.length) return;

        const today = new Date().toISOString().split('T')[0]; // "2025-07-21"

        const filter = taskData.filter(data => {
            const due = new Date(data.due_date).toISOString().split('T')[0];
            return due >= today && String(data.is_completed) === 'false';
        });

        const numbertasks = taskData.filter(data => {
            const due = new Date(data.due_date).toISOString().split('T')[0];
            return due === today;
        });


        setNumbertask(numbertasks.length);
        setFilterTask(filter);

        //solve hte progress 
        const rate = numbertasks.length
            ? Math.round(((numbertasks.length - filter.length) / numbertasks.length) * 100)
            : 0;

        // console.log('ratee: ',rate)
        setProgress(rate)
    }, [taskData])

    useEffect(() => {
        if (!habitData.length) return;

        const grouped = habitData.reduce((acc, habit) => {
            const freq = habit.frequency;
            if (!acc[freq]) acc[freq] = [];
            acc[freq].push(habit);
            return acc;
        }, {});

        setGroupedHabits(grouped);
    }, [habitData]);

    // console.log("Grouped habit: ", groupedHabits)

    const handleCheckbox = async (taskid, isComplete, task_title, due_date) => {

        try {
            await API.put('todo/tasks/' + taskid + "/", {
                task_title: task_title,
                due_date: due_date,
                is_completed: isComplete,
            })
        } catch (err) {
            console.error("Error when sending data: ", err)
        }
    }

    const CircularProgressWithLabel = ({ value, size = 200, thickness = 5, color = "#dbb1ffd5" }) => {
        return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                {/* Background ring - full 100% */}
                <CircularProgress
                    variant="determinate"
                    value={100}
                    size={size}
                    thickness={thickness}
                    sx={{
                        color: '#404040ff', // Light grey background
                        position: 'absolute',
                    }}
                />
                {/* Foreground ring - actual progress */}
                <CircularProgress
                    variant="determinate"
                    value={value}
                    size={size}
                    thickness={thickness}
                    sx={{
                        color: color,
                        transition: '0.5s ease-in-out',
                    }}
                />
                {/* Center label */}
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{ color: color, fontWeight: 'bold', fontSize: "48px" }}
                    >
                        {`${Math.round(value)}%`}
                    </Typography>
                </Box>
            </Box>
        );
    };


    return (
        <div className="dashboard-page">
            <div className="sticky-container">
                <h1>Dashboard</h1>
            </div>

            <div className="main-dashboad">
                <div className="dashboard-card-lists">
                    <div className="weather-time">
                        {weatherData ? (
                            <div className="description">
                                <p className="weather-temp">{weatherData.main.temp}°C</p>
                                <p className="weather-main">{weatherData.weather[0].main}</p>
                                <div className="minor-info">
                                    <p className="weather-date">{new Date().getMonth() + 1}/{new Date().getDay()}/{new Date().getFullYear()}</p>
                                    <p className="weather-time-detail">{new Date().toDateString().split(' ')[0]} | {new Date().getHours()}:{new Date().getMinutes()}</p>
                                </div>

                            </div>
                        ) : (<p>No data available</p>)}
                    </div>

                    <div className="quote">
                        {quote ? (
                            <div>
                                <p style={{ fontStyle: "italic" }}>{quote.q}</p>
                                <p>- {quote.a} -</p>
                            </div>
                        ) : (<p>No data available</p>)}
                    </div>

                    <div className="mood-chart">
                        <div className="mood-actions">
                            <p className="card-title">Mood Chart</p>
                        </div>
                        <div className="chart-wrapper">
                            {xAxisDays && xAxisDays.length > 0 ? (
                                <LineChart
                                    series={[
                                        {
                                            data: moodSeries,
                                            color: "#dbb1ffd5",
                                            fontSize: "20px"
                                        },
                                    ]}
                                    xAxis={[
                                        {
                                            scaleType: "band",
                                            data: xAxisDays,
                                        }
                                    ]}
                                    yAxis={[
                                        {
                                            min: 0,
                                            max: 9,
                                            tickMinStep: 1,
                                            valueFormatter: (value) => moodLabelFromValue[value] ?? value,
                                        },
                                    ]}
                                    height={250}
                                    sx={{
                                        "& .MuiChartsAxis-line": {
                                            stroke: "#ffffff !important",
                                            strokeWidth: 1,
                                        },
                                        "& .MuiChartsAxis-tickLabel": {
                                            fill: "#ffffff !important",
                                            fontSize: "16px !important",
                                        },
                                        "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
                                            fill: "#ffffff",
                                            fontSize: "20px !important",
                                        },
                                        "& .MuiChartsLegend-root": {
                                            color: "#ffffff !important",
                                        },

                                    }}
                                    slotProps={{ tooltip: { trigger: 'none' } }}
                                    highlightScope={{ highlighted: 'none', faded: 'none' }}

                                />) : (
                                <p>No data available</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dashboard-card-lists">
                    <div className="today-tasks">
                        <div className="today-tasks-actions">
                            <p className="card-title">Coming tasks</p>
                            <Link to="/todo" className="seemore">See More</Link>
                        </div>
                        <table className="today-tasks-table">
                            <tbody>
                                {filtertask.slice(0, 3).map((task) => {
                                    const checked = task.is_completed === true || task.is_completed === 'true';
                                    return (
                                        <tr key={task.id}>
                                            <td>{task.task_title}</td>
                                            <td>{task.task_content.slice(0, 50)}</td>
                                            <td>
                                                <Checkbox
                                                    readOnly
                                                    checked={checked}
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                        '& svg': {
                                                            fontSize: 24,
                                                            boxSizing: 'border-box',
                                                        },
                                                        color: '#dbb1ffd5',
                                                        '&.Mui-checked': {
                                                            color: '#dbb1ffd5',
                                                        },
                                                    }}
                                                    onChange={(e) =>
                                                        handleCheckbox(
                                                            task.id,
                                                            e.target.checked,
                                                            task.task_title,
                                                            task.due_date
                                                        )
                                                    }
                                                />

                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="completed-chart">
                        <div className="today-tasks-actions">
                            <p className="card-title">Completed Task</p>
                        </div>

                        <div className="chart-wrapper">

                            <CircularProgressWithLabel value={progress} />
                        </div>
                    </div>
                    <div className="habit-today">
                        <div className="habit-today-actions">
                            <p className="card-title">Habit today</p>
                            <Link to="/habit" className="seemore">Tracker</Link>
                        </div>

                        <div className="card-value">
                            {['daily', 'weekly', 'monthly'].map((freq) => {
                                return (
                                    <div key={freq}>
                                        <h3>{freq.toUpperCase()}</h3>
                                        <ul>
                                            {(groupedHabits[freq] || []).slice(0, 3).map(habit => {
                                                return (
                                                    <li key={habit.id}>{habit.name}</li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                )
                            })}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
