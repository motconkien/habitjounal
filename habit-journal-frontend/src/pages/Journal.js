import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import API from "../api";
import { LineChart } from "@mui/x-charts";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarCheck } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";


export default function Journal() {
  const [journals, setJournals] = useState([])
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [xAxisDays, setXAxisDays] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState(journals);
  const [moodChoices, setMoodchoice] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null); 


  //fetch data from api
  const fetchJournals = async () => {
    try {
      const res = await API.get('journal/');
      setJournals(res.data);
    } catch (err) {
      console.error('Error fetching journals:', err);
    }
  };

  //fetch moodchoice

  const fetchMoodchoice = async () => {
    try {
      const res = await API.get('journal/mood-choices/');
      setMoodchoice(res.data);
      // console.log("AAAAA:",res.data)
    } catch (err) {
      console.error('Error fetching mood choices:', err);
    }
  };

  const handleOpenModal = () => {
    setContent('');
    setTitle('');
    setMood('');
    setShowModal(true);

    // Fetch mood choices only if not already fetched
    if (moodChoices.length === 0) {
      fetchMoodchoice();
    }
  };

  //handle submit journal content
  const handleAddJournal = async (e) => {
    e.preventDefault();
    try {
      if (selectedJournal) {
        await API.put('journal/' + selectedJournal.id + "/", { title, content, mood });
      } else {
        await API.post('journal/', { title, content, mood })
      }

    } catch (err) {
      console.error('Failed to create journal:', err);
    }

    //clear form 
    setContent('');
    setTitle('');
    // setMood('');
    setShowModal(false);
    setSelectedJournal(null)
  };

  useEffect(() => {
    fetchJournals();
    const intervalId = setInterval(() => {
      fetchJournals();
    }, 500);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  //open model
 // for modal 
  const openModal = (Journal) => {
    setSelectedJournal(Journal);
  }
  //close model
  const closeModal = () => {
    setSelectedJournal(null);
  }

  //handle edit 
  const handleEdit = (journal) => {
    setTitle(journal.title);
    setContent(journal.content);
    setSelectedJournal(journal);
    setShowModal(true);
  }

  //handle delete
  const handleDelete = async (journalId) => {
    try {
      await API.delete('journal/' + journalId + "/");
      setSelectedJournal(null);
      // fetchJournals();
    } catch (err) {
      console.error('Failed to delete journal:', err);
      alert('Failed to delete journal. Please try again.');
    }
  };

  //handle mood label 
  const getMoodLabel = (value) => {
    fetchMoodchoice();
    const match = moodChoices.find(([val]) => val === value);
    return match ? match[1] : value;
  }

  //Statistic part:

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

  // const moodDate = journals.map(journal=>journal.date);

  //copy by journals.slice() or [...journals]
  const moodData = [...journals]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(journal => ({
      x: journal.date,
      y: numericToMoodLabel[journal.mood],
    }));

  const moodDataFilled = xAxisDays.map(date => {
    const foundEntry = moodData.find(entry => entry.x === date);
    return {
      x: date,
      y: foundEntry ? foundEntry.y : 4
    }
  })

  const moodSeries = moodDataFilled.map(mood => mood.y);
  // console.log("Final data:", JSON.stringify(moodDataFilled))

  //dont forget remove minute 
  const onRangeSelect = (start, end) => {
    // console.log("What: ", start, "   ", end)

    if (!start || !end) {
      setFilteredJournals(journals); // no filter, show all
      return;
    }

    start = start.setHours(0, 0, 0, 0);
    end = end.setHours(0, 0, 0, 0);
    const filteredJournals = journals.filter(journal => {
      const journalDate = new Date(journal.date).setHours(0, 0, 0, 0);
      return journalDate >= start && journalDate <= end;
    });

    setFilteredJournals(filteredJournals);
  };


  const gettimeline = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i)); // oldest first, today last
      return d.toISOString().split("T")[0];
    });
  };

  const getCustomTimeline = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = [];
    const current = new Date(start);

    while (current <= end) {
      result.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    return result;
  };

  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredJournals(journals);
      setXAxisDays(gettimeline());
    } else {
      onRangeSelect(startDate, endDate);
      setXAxisDays(getCustomTimeline(startDate, endDate));
    }
  }, [journals, startDate, endDate]);


  const wordCount = filteredJournals.reduce((acc, entry) => {
    // acc = running total
    // entry = current journal entry
    // 0 is initial value of acc
    const words = entry.content.trim().split(/[.,\s]+/);
    return acc + words.length;
  }, 0)

  const moodCount = {}
  filteredJournals.forEach(entry => {
    const mood = entry.mood;
    moodCount[mood] = moodCount[mood] || 0 + 1
  });

  const clearDate = () => {
    setStartDate(null);
    setEndDate(null)
  }


  return (
    <div className="journal-page">
      <h1>My Journals</h1>
      <div className="actions-control">
        <div className="left-section">
          <button className="add-btn" onClick={handleOpenModal}>New journal</button>
        </div>
        <div className='right-section'>
          <div className='datepicker'>
            <FaCalendarCheck size={24} style={{ color: "#cda7d2" }} />
            <DatePicker
              className="datepicker-input"
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(dates) => {
                const [start, end] = dates;
                setStartDate(start || null);
                setEndDate(end || null);
              }}
              isClearable={false}
              dateFormat="yyyy/MM/dd"
              placeholderText="Select date range"
            />
            {(startDate || endDate) && (

              <IoIosCloseCircle onClick={clearDate} size={26} style={{ color: "#cda7d2" }} />

            )}
          </div>
        </div>
      </div>
      <div className="journal-statistic">
        <div className="journal-statistic-card-lists">
          <div className="joural-statistic-card" style={{ flex: 2 }}>
            <div className="journal-statistic-card-two-cols">
              <div className="joural-statistic-card-two-rows">
                <div className="joural-statistic-card-sub">
                  <p className="journal-label">Total</p>
                  <p className="journal-value">{filteredJournals.length}</p>
                </div>
                <div className="joural-statistic-card-sub">
                  <p className="journal-label">Words</p>
                  <p className="journal-value">{wordCount}</p>
                </div>
              </div>

              <div className="mood-table-container">
                <p className="journal-label">Mood Statistic</p>
                <div className="journal-value-mood">
                  <table className="mood-table">
                    <tbody>
                      {Object.entries(moodCount).map(([mood, count]) => (
                        <tr key={mood}>
                          <td>{mood}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

          <div className="joural-statistic-card" style={{ flex: 5 }}>
            <p className="journal-label">Mood Chart</p>
            <div>
              <LineChart
                series={[
                  {
                    data: moodSeries,
                    color: "#96529b"
                  },
                ]}
                xAxis={[
                  {
                    scaleType: "band",
                    data: xAxisDays,
                    // valueFormatter: (value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' }),
                  }
                ]}
                yAxis={[
                  {
                    min: 0,
                    max: 9,
                    tickMinStep: 1,// fixed values
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
                    fontSize: 12,
                  },
                  "& .MuiChartsLegend-root": {
                    color: "#ffffff !important",
                  },

                }}
                slotProps={{ tooltip: { trigger: 'none' } }}
                highlightScope={{ highlighted: 'none', faded: 'none' }}

              />


            </div>
          </div>

        </div>
      </div>

      <div className="journal-list">
        {filteredJournals.slice().reverse().map((Journal) => (
          <div
            key={Journal.id}
            className="journal-card"
            onClick={() => openModal(Journal)}>
            <div className="header">
              <h3>{Journal.title}</h3>
              <small>{new Date(Journal.date).toLocaleDateString()}</small>
            </div>
            <p className="content">{Journal.content.slice(0, 100)}</p>
            <div className="mood">
              <small><strong>Mood:</strong> {getMoodLabel(Journal.mood)}</small>
            </div>

          </div>
        ))}
      </div>

      {selectedJournal && (
        <Modal onClose={closeModal}>
          <div className="modal-header">
            <h2>{selectedJournal.title}</h2>
            <FaTimes size={24} className="close-button" onClick={closeModal} />
          </div>
          <p><em>{new Date(selectedJournal.date).toLocaleString()}</em></p>
          <p>{selectedJournal.content}</p>
          <p>{getMoodLabel(selectedJournal.mood)}</p>
          <div className="actions">
            <button onClick={() => handleEdit(selectedJournal)}>
              <FaEdit style={{ marginRight: 8 }} />
              Edit
            </button>
            <button onClick={() => handleDelete(selectedJournal.id)}>
              <FaTrash style={{ marginRight: 8 }} />
              Delete
            </button>

          </div>
        </Modal>
      )}

      {/* for modal creating new journal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3>Record your emotions today. Smile!!!</h3>
          <form onSubmit={handleAddJournal} className="form-group">
            <input
              className="input-item"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <br />
            <textarea
              className="input-item"
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <br />
            <select
              className="input-item"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              required
            >
              <option value="">Select a mood</option>
              {moodChoices.map(([value, label]) => (
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
  );
}