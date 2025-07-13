import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import API from "../api";

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
    setMood('');
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
  return (
    <div className="journal-page">
      <h1>My Journals</h1>
      <button className="add-btn" onClick={handleOpenModal}>New journal</button>

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