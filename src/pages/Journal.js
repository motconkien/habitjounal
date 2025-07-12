import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import API, {setAuthToken} from "../api";
import axios from "axios";

export default function Journal() {
  const [journals, setJournals] = useState([])
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
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

//handle submit journal content
  const handleAddJournal = async (e) => {
    e.preventDefault();
    try {
      if (selectedJournal) {
        await API.put('journal/'+selectedJournal.id+"/", {title,content});
      } else {
        await API.post('journal/',{title,content})
      }
      
    } catch (err) {
      console.error('Failed to create journal:', err);
    }

    //clear form 
    setContent('');
    setTitle('');
    setShowModal(false);
    setSelectedJournal(null)

    //fetch new
    // fetchJournals();
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

  return (
    <div className="journal-page">
      <h1>My Journal</h1>
      <button className="write-btn" onClick={() => setShowModal(true)}>New journal</button>

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