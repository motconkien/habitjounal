import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { GoChevronRight, GoChevronLeft } from "react-icons/go";
import API from '../api';
import Modal from "../components/Modal";
import { FaTimes, FaEdit, FaTrash, FaPercentage } from "react-icons/fa";
import { addYears } from 'date-fns';
import { PieChart } from '@mui/x-charts/PieChart';
import { LinearProgress, Typography, Box } from '@mui/material';


export default function Habit() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [summaryRecord, setSummaryRecord] = useState([]);
  const [habitname, setHabitName] = useState('');
  const [habitdes, setDescription] = useState('');
  const [habitfreq, setFrequency] = useState('');
  const [habitstas, setStastistic] = useState([]);

  const getDatesForMonth = (currentDate) => {
    const daysInMonth = currentDate.daysInMonth();
    const startOfMonth = currentDate.startOf('month');
    const dates = [];

    for (let i = 0; i < daysInMonth; i++) {
      const date = startOfMonth.add(i, 'day');
      dates.push({
        date,
        dayLetter: date.format('dd')[0], // e.g., 'M' for Monday
        dayNumber: date.format('D')      // e.g., '1'
      });
    }
    return dates;
  }
  const dates = getDatesForMonth(currentDate);

  const fetchSummaryRecord = async () => {
    try {
      const res = await API.get('habit/records-summary/');
      setSummaryRecord(res.data);
      console.log("AAAAA:", res.data)
    } catch (err) {
      console.error('Error fetching records summary:', err);
    }
  };


  //handle new habit 
  const [showModal, setShowModal] = useState(false);
  //fetch choice
  const [frequencyChoices, setFrequencychoice] = useState([]);

  const fetchFrequencychoice = async () => {
    try {
      const res = await API.get('habit/frequency-choices/');
      setFrequencychoice(res.data);
      // console.log("AAAAA:",res.data)
    } catch (err) {
      console.error('Error fetching frequency choices:', err);
    }
  };

  const handleOpenModal = () => {
    setHabitName('');        // clear form fields
    setDescription('');
    setSelectedHabit(null);  // clear selected habit
    setShowModal(true);

    // Fetch mood choices only if not already fetched
    if (frequencyChoices.length === 0) {
      fetchFrequencychoice();
    }
  };


  //handle submit habit
  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!habitfreq) {
      alert('Please select frequency!');
      return;
    }
    try {
      await API.post('habit/', {
        name: habitname,
        description: habitdes,
        frequency: habitfreq,
      })
    }

    catch (err) {
      console.error('Failed to create habit:', err);
    }

    //clear form 
    setHabitName('');
    setDescription('');
    setFrequency('');
    setShowModal(false);
  };

  const handleHabit = async (HabitId) => {
    try {
      const res = await API.get('habit/' + HabitId + "/");
      setSelectedHabit(res);
      return res
      // fetchJournals();
    } catch (err) {
      console.error('Failed to delete habit:', err);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const handleToggleCheckbox = async (habitid, date, isComplete) => {
    // const recordId = habit.records_id?.[date];

    try {
      console.log("what the fuck: ", {
        habit: habitid,
        date,
        is_completed: isComplete
      })
      await API.post('habit/record/', {
        habit: habitid,
        date,
        is_completed: isComplete
      })

    } catch (err) {
      console.error('Toggle error:', err.response?.data || err.message);
      alert('Error: ' + JSON.stringify(err.response?.data || {}));
    }
  };

  //open model
  const [selectedHabit, setSelectedHabit] = useState(null); // for modal 

  const openModal = async (habitid) => {
    try {
      const res = await handleHabit(habitid);
      setSelectedHabit(res.data);  // set actual habit data here
      console.log('Opening modal for habit:', res.data);
    } catch (err) {
      console.error('Failed to open habit modal:', err);
    }
  };
  //close model
  const closeModal = () => {
    setSelectedHabit(null);
  }

  //handle edit 
  const handleEdit = (Habit) => {
    setHabitName(Habit.name);
    setDescription(Habit.description);
    setSelectedHabit(Habit);
    setShowModal(true);
  }

  //handle delete
  const handleDelete = async (HabitId) => {
    try {
      await API.delete('habit/' + HabitId + "/");
      setSelectedHabit(null);
      // fetchJournals();
    } catch (err) {
      console.error('Failed to delete habit:', err);
      alert('Failed to delete habit. Please try again.');
    }
  };

  //handle statistic 
  const fetchStatistic = async () => {
    try {
      const res = await API.get('habit/habit-statistic/')
      setStastistic(res.data);
    } catch (err) {
      console.error('Failed to delete habit:', err);
      alert('Failed to delete habit. Please try again.');
    }
  };

  useEffect(() => {
    fetchSummaryRecord();
    fetchStatistic();
    const intervalId = setInterval(() => {
      fetchSummaryRecord();
      fetchStatistic();
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  //handle calulcate for distribution
  const frequencies = ['daily', 'weekly', 'monthly'];
  const distribution = frequencies.map((freq) => {
    const count = habitstas[freq]?.number_habits || 0;
    const total = habitstas.total_habits || 1;
    return {
      label: freq,
      value: count,
      dist: Math.round((count / total) * 100),
      completence_rate: habitstas[freq]?.percentage || 0
    }
  })


  //handle pie chart
  const COLORS = ['#cda7d2', '#96529b', '#7338a0'];
  const pieData = distribution.map((item, index) => ({
    id: index,
    value: item.value,
    label: item.label,
    color: COLORS[index % COLORS.length],
  }));

  const colors = {
    daily: '#cda7d2',
    weekly: '#96529b',
    monthly: '#7338a0',
  };



  return (
    <div className="habit-page">
      <div className="habit-header">
        <h1>Habit Tracker</h1>
        <button className="add-btn" onClick={handleOpenModal}>New Habit</button>
      </div>

      <div className='habit-statistic'>
        <div className='habit-card-lists'>
          <div className='habit-card'>
            <div className="habit-card-two-column">
              <div className="habit-card-sub">
                <p className="habit-label">Total Habits</p>
                <p className="habit-value">{habitstas.total_habits}</p>
              </div>
              <div className="habit-card-sub">
                <p className="habit-label">Max Streak</p>
                <p className="habit-value">{Math.max(...summaryRecord.map(habit => habit.streak))}</p>
              </div>
            </div>

          </div>
          <div className='habit-card'>
            <h3>Frequency Distribution</h3>
            <div style={{ color: 'white' }}>
              <PieChart
                series={[
                  {
                    data: pieData,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                    valueFormatter: (dataPoint) => `${dataPoint.label}: ${dataPoint.value} habits`,
                  },
                ]}
                height={200}
                width={200}
                slotProps={{
                  legend: {
                    sx: {
                      fontSize: 14,
                      color: 'white',
                      // [`.${labelMarkClasses.fill}`]: {
                      // fill: 'white',
                      // },
                    },
                  },
                }}
              />

            </div>

          </div>
          <div className='habit-card'>
            <h3>Completence Rate</h3>
            {distribution.map(({ label, completence_rate }) => (
              <Box key={label} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}: {completence_rate}%
                </Typography>
                <LinearProgress 
                  variant="determinate"
                  value={completence_rate}
                  sx={{
                    height: 20,
                    borderRadius: 5,
                    backgroundColor: '#2d2d2d',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors[label],
                    },
                  }}
                />
              </Box>
            ))}

          </div>
        </div>
      </div>

      <div className="habit-container">
        {/* Month Navigation */}
        <div className="calendar-controls">
          <button className='btn' onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}>
            <GoChevronLeft size={24} />
          </button>
          <h2>{currentDate.format('MMMM, YYYY')}</h2>
          <button className='btn' onClick={() => setCurrentDate(currentDate.add(1, 'month'))}>
            <GoChevronRight size={24} />
          </button>
        </div>

        <div className='habit-controls'>
          {/* Day of week row */}
          <div className="row header-row">
            <div className="cell label-cell" style={{ gridRow: 'span 2' }}>Habit</div>
            {dates.map((d) => (
              <div key={d.date} className="cell day-letter">{d.dayLetter}</div>
            ))}
            
            <div className="cell streak-label" style={{ gridRow: 'span 2' }}>Streak</div>
            {/* Day number row */}
            {/* <div className="row date-row"> */}
              {dates.map((d) => (
                <div key={d.date} className="cell day-number">{d.dayNumber}</div>
              ))}
            {/* </div> */}
          </div>

          

          {/* Habit rows */}
          {summaryRecord.map((habit) => (
            <div className="row habit-row" key={habit.name} >
              <div className="cell label-cell" onClick={() => openModal(habit.id)}>{habit.name}</div>
              {dates.map((d) => {
                const iso = d.date.format('YYYY-MM-DD');
                return (
                  <div key={iso} className="cell checkbox">
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={habit.records[iso] || false}
                        onChange={(e) => handleToggleCheckbox(habit.id, iso, e.target.checked)}
                        readOnly
                      />
                      <span className="checkmark" />
                    </label>
                  </div>
                );
              })}
              <div
                className={`cell streak-label value ${habit.streak >= 10 ? 'hot-streak' : 'normal-streak'
                  }`}
              >
                {habit.streak} 🔥
              </div>
            </div>
          ))}
        </div>

        {selectedHabit && (
          <Modal onClose={closeModal}>
            <div className="modal-header">
              <h2>{selectedHabit.name}</h2>
              <FaTimes size={24} className="close-button" onClick={closeModal} />
            </div>
            <p>{selectedHabit.description == '' ? 'Null' : selectedHabit.description}</p>
            <p>Frequency: <em>{(selectedHabit.frequency)} </em></p>
            <div className="actions">
              <button onClick={() => handleEdit(selectedHabit)}>
                <FaEdit style={{ marginRight: 8 }} />
                Edit
              </button>
              <button onClick={() => handleDelete(selectedHabit.id)}>
                <FaTrash style={{ marginRight: 8 }} />
                Delete
              </button>
            </div>
          </Modal>
        )}

        {/* for modal creating new habit */}
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <h3>Disciline baby!!!</h3>
            <form onSubmit={handleAddHabit} noValidate className="form-group">

              {/* Habit Name */}
              <div className='habit-items name'>
                <label className="form-label" htmlFor="habit-name">Habit Name:</label>
                <input
                  id="habit-name"
                  className="input-item"
                  type="text"
                  placeholder="e.g. Meditate, Workout..."
                  value={habitname}
                  onChange={(e) => setHabitName(e.target.value)}
                  required
                />
              </div>


              {/* Frequency */}
              <div className='habit-items frequency'>
                <label className="form-label">Select Frequency:</label>
                <div className="frequency-options">
                  {frequencyChoices.map(([value, label]) => (
                    <label key={value} style={{ display: 'block', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="frequency"
                        value={value}
                        checked={habitfreq === value}
                        onChange={() => setFrequency(value)}
                      />
                      {` ${label}`}
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className='habit-items description'>
                <label className="form-label" htmlFor="habit-description">Description:</label>
                <textarea
                  id="habit-description"
                  className="input-item"
                  placeholder="Describe the goal, purpose, or details..."
                  value={habitdes}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>


              <div className="actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}
