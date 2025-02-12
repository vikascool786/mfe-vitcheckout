import React from 'react'
import './Feedback.scss';

const Feedback = () => {
    return (
        <div className="feedback-container">
            <button className='feedback-submit-button'>Give Feedback</button>
            <p className='text-bottom-feedback'>We are constantly looking for ways to improve.</p>
            <p className='text-top-feedback'>Want to Provide Feedback?</p>
        </div>
    );
}

export default Feedback