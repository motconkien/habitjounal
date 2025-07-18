import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import API from "../api";
import { LineChart } from "@mui/x-charts";

export default function Journal() {
  const [journals, setJournals] = useState([])
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] =useState('');
   //open modal to create new journal 
  const [showModal, setShowModal] = useState(false);
  
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
const [moodChoices, setMoodchoice] = useState([]);

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
        await API.put('journal/'+selectedJournal.id+"/", {title,content,mood});
      } else {
        await API.post('journal/',{title,content,mood})
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
  const [selectedJournal, setSelectedJournal] = useState(null); // for modal 
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
      await API.delete('journal/'+journalId+"/");
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
    return match ? match[1]:value;
  }

  //Statistic part:
  const wordCount = journals.reduce((acc,entry) => {
    // acc = running total
    // entry = current journal entry
    // 0 is initial value of acc
    const words = entry.content.trim().split(/[.,\s]+/);
    return acc + words.length;
  },0)

  const moodCount = {}
  journals.forEach(entry => {
    const mood = entry.mood;
    moodCount[mood] = moodCount[mood] || 0 + 1
  });
  
  const numericToMoodLabel = {
    "happy": 9,
    "fun":8,
    "productive":7,
    "calm":6,
    "bored":5,
    "tired":4,
    "anxious":3,
    "fearful":2,
    "sad":1,
    "angry":0,
  };
  const moodData = journals
  .slice() // avoid mutating original
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .map(journal => ({
    x: journal.date,
    y: numericToMoodLabel[journal.mood],
  }));

  console.log("MNood:",moodData)

  // const moodDate = journals.map(journal=>journal.date);
  // const moodValue = journals.map(journal => numericToMoodLabel[journal.mood]);

  return (
    <div className="journal-page">
      <h1>My Journals</h1>
      <button className="add-btn" onClick={handleOpenModal}>New journal</button>
      
      <div className="journal-statistic">
        <div className="journal-statistic-card-lists">
          <div className="joural-statistic-card">
              <p className="journal-label">Total</p>
            <p className="journal-value">{journals.length}</p>
          </div>
          <div className="joural-statistic-card">
              <p className="journal-label">Words</p>
            <p className="journal-value">{wordCount}</p>
          </div>
          <div className="joural-statistic-card">
              <p className="journal-label">Mood Chart</p>
                <div>
              <LineChart
                xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                series={[
                  {
                    data: [2, 5.5, 2, 8.5, 1.5, 5],
                  },
                ]}
                height={300}
              />
              </div>
          </div>
          <div className="joural-statistic-card">
            <p className="journal-label">Mood Statistic</p>
            <div className="journal-value">
              {
                Object.entries(moodCount).map(([mood, count]) => (
                  <div key={mood}>{mood}:{count}</div>
                ))
              }
            </div>
          </div>

        </div>
      </div>

      <div className="journal-list">
        {journals.map((Journal) => (
          <div 
            key={Journal.id} 
            className="journal-card"
            onClick={() => openModal(Journal)}>
            <div className="header">
              <h3>{Journal.title}</h3>
              <small>{new Date(Journal.date).toLocaleDateString()}</small> 
            </div>
            <p className="content">{Journal.content.slice(0,100)}</p>
            <small><strong>Mood:</strong> {getMoodLabel(Journal.mood)}</small>
          </div>
        ))}
      </div>
      
      {selectedJournal && (
        <Modal onClose={closeModal}>
          <div className="modal-header">
            <h2>{selectedJournal.title}</h2>
            <FaTimes size={24} className="close-button" onClick={closeModal}/>
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