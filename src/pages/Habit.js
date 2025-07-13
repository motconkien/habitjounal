import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { GoChevronRight, GoChevronLeft} from "react-icons/go";
import API from '../api';
import Modal from "../components/Modal";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";

export default function Habit() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [summaryRecord, setSummaryRecord] = useState([]);
  const [habitname, setHabitName] = useState('');
  const [habitdes, setDescription] = useState('');
  const [habitfreq, setFrequency] = useState('');

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
    console.log("AAAAA:",res.data)
  } catch (err) {
    console.error('Error fetching records summary:', err);
    }
  };
  useEffect(() => {
      fetchSummaryRecord();
      const intervalId = setInterval(() => {
      fetchSummaryRecord();
    }, 500);
  return () => clearInterval(intervalId);
  }, []);

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
    try {
      await API.post('habit/',{ 
                                name: habitname,
                                description: habitdes,
                                frequency: habitfreq,})
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
      const res = await API.get('habit/'+HabitId+"/");
      setSelectedHabit(res);
      return res
      // fetchJournals();
    } catch (err) {
      console.error('Failed to delete habit:', err);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const handleToggleCheckbox = async (habit, date, isComplete) => {
    const recordId = habit.records_id?.[date];

    try {
      if (recordId) {
        // Update existing record — include habit too
        console.log("what the fuck: ", {
          habit: habit.id,
          date,
          is_completed: isComplete,
        })
        await API.put(`habit/record/${recordId}/`, {
          habit: habit.id,
          date,
          is_completed: isComplete,
        });
      } else {
        // Create new record
        await API.post('habit/record/', {
          habit: habit.id,
          date,
          is_completed: isComplete,
        });
      }
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
      await API.delete('habit/'+HabitId+"/");
      setSelectedHabit(null);
      // fetchJournals();
    } catch (err) {
      console.error('Failed to delete habit:', err);
      alert('Failed to delete habit. Please try again.');
    }
  };

  return (
    <div className="habit-page">
      <div className="habit-header">
        <h1>Habit Tracker</h1>
        <button className="add-btn" onClick={handleOpenModal}>New Habit</button>
      </div>

      <div className="habit-container">
        {/* Month Navigation */}
        <div className="calendar-controls">
          <button  className = 'btn'onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}>
            <GoChevronLeft size={24}/>
          </button>
          <h2>{currentDate.format('MMMM, YYYY')}</h2>
          <button className = 'btn' onClick={() => setCurrentDate(currentDate.add(1, 'month'))}>
            <GoChevronRight size={24}/>
          </button>
        </div>

        <div className='habit-controls'>
          {/* Day of week row */}
        <div className="row header-row">
          <div className="cell label-cell">Habit</div>
          {dates.map((d) => (
            <div key={d.date} className="cell day-letter">{d.dayLetter}</div>
          ))}
          <div className="cell streak-label">Streak</div>
        </div>

        {/* Day number row */}
        <div className="row date-row">
          <div className="cell label-cell" />
          {dates.map((d) => (
            <div key={d.date} className="cell day-number">{d.dayNumber}</div>
          ))}
          <div className="cell streak-label" />
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
            <p>{selectedHabit.description == ''? 'Null' : selectedHabit.description}</p>
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
            <form onSubmit={handleAddHabit} className="form-group">
            <input
              className="input-item"
              type="text"
              placeholder="Habit"
              value={habitname}
              onChange={(e) => setHabitName(e.target.value)}
              required
            />
            <br />
            <textarea
              className="input-item"
              placeholder="Description: purpose, goal, etc"
              value={habitdes}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <br />
            <select
              className="input-item"
              value={habitfreq}
              onChange={(e) => setFrequency(e.target.value)}
              required
            >
              <option value="">Select frequency</option>
              {frequencyChoices.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <br />
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
