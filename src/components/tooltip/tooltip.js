import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import './tooltip.css';
import { BACKEND_URL } from '../../constants';

const Tooltip = ({ userId, originalContent, suggestion, type, position, onInsertSuggestion, onCloseTooltip }) => {
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const [liked, setLiked] = useState(false); 

  // Determine the header text based on the type
  const getHeaderText = () => {
    if (type === 'revision') {
      return 'Revision Suggestion (Replace)';
    } else if (type === 'completion') {
      return 'Completion Suggestion (Append)';
    }
    return '';
  };

  // Save suggestions that user liked, and unsave suggestions that users unliked, in order to have training set for finetuning
  const handleLike = async () => {
    if (!liked) {
      try {
        setLiked(true);
  
        const response = await fetch(`${BACKEND_URL}/ratings/add_or_remove?mode=add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            originalContent,
            suggestionContent: suggestion,
            rating: 1, 
            type,
          }),
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          setLiked(false);
          console.error('Error liking suggestion:', result.errorMessages);
        } 
      } catch (error) {
        setLiked(false);
        console.error('Fetch error liking suggestion:', error);
      }
    } else {
      try {
        setLiked(false);
  
        const response = await fetch(`${BACKEND_URL}/ratings/add_or_remove?mode=remove`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            originalContent,
            suggestionContent: suggestion,
          }),
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          setLiked(true);
          console.error('Error unliking suggestion:', result.errorMessages);
        }
      } catch (error) {
        setLiked(true);
        console.error('Fetch error unliking suggestion:', error);
      }
    }
  };

  const insertSuggestion = () => {
    onInsertSuggestion();
    onCloseTooltip();
  };

  const renderSuggestion = (suggestion) => {
    if (typeof suggestion !== 'string') {
      return null;
    }

    const sanitizedSuggestion = suggestion.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return <p dangerouslySetInnerHTML={{ __html: sanitizedSuggestion }} />;
  };

  return (
    <Draggable
      position={{ x: tooltipPosition.left, y: tooltipPosition.top }}
      onStop={(e, data) => {
        setTooltipPosition({ left: data.x, top: data.y });
      }}
    >
      <div className="tooltip" style={{ position: 'absolute', zIndex: 1000 }}>
        <div className="tooltip-header">
          <span className="tooltip-type">{getHeaderText()}</span>
          <button className="close-button" onClick={onCloseTooltip}>
            &#x2715;
          </button>
        </div>
        <div className="tooltip-body">
          {renderSuggestion(suggestion)}
          <div className="rating-buttons">
            <button className={`thumb-button ${liked ? 'active' : ''}`} onClick={handleLike}>
              <FontAwesomeIcon icon={faThumbsUp} />
            </button>
          </div>
          <button onClick={insertSuggestion}>Insert</button>
        </div>
      </div>
    </Draggable>
  );
};

export default Tooltip;


// OpenAI. (n.d.). ChatGPT (Version 3.5) [Computer software]. Retrieved June, 2024, from https://www.openai.com/chatgpt
// Prompt: "i have to make a website like outlook but basically add ai assistance for drafting emails. what can i use to create the interface for typing up emails?"

// OpenAI. (n.d.). ChatGPT (Version 3.5) [Computer software]. Retrieved July, 2024, from https://www.openai.com/chatgpt
// Prompt: "can you make it so that when the user first clicks on either thumb, the thumb is highlighted, and the suggsetion and rating is added, but if the user clicks the same thumb again, that means they undid that rating, which means delete that suggestion and rating. if the user switches from from like to dislike or vice versa, then update the suggestion with the new rating in the database"
