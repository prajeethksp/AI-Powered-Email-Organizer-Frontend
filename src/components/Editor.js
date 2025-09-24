import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import Delta from 'quill-delta';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import axios from 'axios';
import Tooltip from './tooltip/tooltip';
import { GlobalContext } from '../Context/GlobalContext';
import { BACKEND_URL, currentUser } from '../constants';

Quill.register('modules/imageResize', ImageResize);

class Editor extends Component {
  static contextType = GlobalContext;

  constructor(props) {
    super(props);
    this.state = {
      suggestion: '',
      suggestionType: '',
      tooltipPosition: { left: 0, top: 0 },
      typingTimeout: null,
      suggestionId: null,
      lastKnownRange: null,
    };
    this.quillRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.fetchSuggestions = this.debounce(this.fetchSuggestions.bind(this), 3000);
  }

  componentDidMount() {
    const quill = this.quillRef.current.getEditor();
    quill.on('selection-change', (range) => {
      if (range) {
        this.setState({ lastKnownRange: range });
      }
    });
  }

  handleChange(html) {
    const { dashboardState, setDashboardState, saveDraft } = this.context;
    const { emailToSend } = dashboardState;
    
    // Only replace current draft with revision suggestion or append to current draft with completion suggestion
    // Do not edit previous replies
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const firstImage = doc.querySelector('img');
    let contentAboveFirstImage = html;
    let indexOfFirstImage = html.length;
  
    if (firstImage) {
      const range = document.createRange();
      range.setStart(doc.body, 0);
      range.setEndBefore(firstImage);
      contentAboveFirstImage = range.cloneContents().textContent;
      indexOfFirstImage = doc.body.innerHTML.indexOf(firstImage.outerHTML);
    }
    
    setDashboardState({
      emailToSend: {
        ...emailToSend,
        emailContent: html,
        indexOfFirstImage
      }
    }, () => { saveDraft(); });
  
    clearTimeout(this.state.typingTimeout);

    if (contentAboveFirstImage.length < 20) {
      return;
    }
  
    if (this.state.suggestionType !== 'completion') {
      const typingTimeout = setTimeout(() => {
        if (!this.state.suggestion || this.state.suggestionType !== 'revision') {
          this.fetchSuggestions(contentAboveFirstImage, 'completion');
        }
      }, 5000);
  
      this.setState({ typingTimeout });
  
      if (!this.state.suggestionType) {
        this.fetchSuggestions(contentAboveFirstImage, 'revision');
      }
    }
  }
  
  
  async fetchSuggestions(content, type = 'revision') {
    try {
      const userId = currentUser()._id;
      const response = await axios.post(`${BACKEND_URL}/openai/suggestions`, { content, type, userId });
      const { data } = response;
      const suggestionId = `suggestion_${Date.now()}`;
      this.setState({ suggestion: data, suggestionId, suggestionType: type });
  
      const quill = this?.quillRef?.current?.getEditor();
      if (quill) {
        const range = quill.getSelection() || this.state.lastKnownRange;
        if (range) {
          const bounds = quill.getBounds(range.index);
          const editorBounds = this.quillRef.current.getEditor().root.getBoundingClientRect();
          const top = bounds.top - editorBounds.height + 40;
          const left = bounds.left;
          this.setState({ tooltipPosition: { left, top } });
        }
      }
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      this.setState({ suggestion: '', suggestionId: null, suggestionType: '' });
    }
  }

  insertSuggestion = () => {
    const { suggestion, suggestionType, lastKnownRange } = this.state;
    const { dashboardState, setDashboardState, saveDraft } = this.context;
    const { emailToSend } = dashboardState;

    if (suggestion) {
      const quill = this.quillRef.current.getEditor();
      const range = quill.getSelection() || lastKnownRange;
      quill.focus();

      if (suggestionType === 'revision') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(emailToSend.emailContent, 'text/html');
        const firstImage = doc.querySelector('img');
        let contentBelowFirstImage = '';
        let indexOfFirstImage = 0;

        console.log("suggestionType", suggestionType, suggestion)

        if (firstImage) {
          indexOfFirstImage = doc.body.innerHTML.indexOf(firstImage.outerHTML);
          contentBelowFirstImage = doc.body.innerHTML.substring(indexOfFirstImage);
        }

        quill.setContents([]);
        const delta = quill.clipboard.convert(suggestion.replace(/\n/g, '<br>'));
        quill.updateContents(new Delta().retain(0).concat(delta));

        if (contentBelowFirstImage) {
          quill.updateContents(new Delta().retain(quill.getLength()).concat(quill.clipboard.convert(contentBelowFirstImage)));
        }

        quill.setSelection(delta.length(), 0);

        setDashboardState({
          emailToSend: {
            ...emailToSend,
            emailContent: quill.root.innerHTML,
          },
        }, () => { saveDraft(); });

      } else if (suggestionType === 'completion') {
        if (range) {
          const delta = quill.clipboard.convert(suggestion.replace(/\n/g, '<br>'));
          quill.updateContents(new Delta().retain(range.index).concat(delta));
          quill.setSelection(range.index + delta.length(), 0);
        } else {
          const length = quill.getLength();
          quill.setSelection(length, 0);
          const delta = quill.clipboard.convert(suggestion.replace(/\n/g, '<br>'));
          quill.updateContents(new Delta().retain(length).concat(delta));
          quill.setSelection(length + delta.length(), 0);
        }
      }

      this.setState({ suggestion: '', suggestionId: null, suggestionType: '' });
    }
  };
  
  handleSelectionChange(range) {
    this.setState({ lastKnownRange: range });
  }

  handleCloseTooltip = () => {
    this.setState({ suggestion: '', suggestionId: null, suggestionType: '' });
    this.quillRef.current.getEditor().focus();
  };

  debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  render() {
    const { dashboardState } = this.context;
    const { emailToSend } = dashboardState;

    return (
      <div style={{ position: 'relative' }}>
        <ReactQuill
          ref={this.quillRef}
          theme="snow"
          value={emailToSend.emailContent}
          onChange={this.handleChange}
          onChangeSelection={this.handleSelectionChange}
          modules={Editor.modules}
          formats={Editor.formats}
          bounds={'#root'}
          placeholder={this.props.placeholder}
        />
        {this.state.suggestion && (
          <Tooltip
            userId={currentUser()._id} 
            originalContent={emailToSend.emailContent.substring(0, emailToSend.indexOfFirstImage)}
            suggestion={this.state.suggestion}
            type={this.state.suggestionType}
            position={this.state.tooltipPosition}
            onInsertSuggestion={this.insertSuggestion}
            onCloseTooltip={this.handleCloseTooltip}
          />
        )}
      </div>
    );
  }
}

Editor.modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' }
    ],
    ['link', 'image', 'video'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  },
  imageResize: {
    parchment: Quill.import('parchment'),
    modules: ['Resize', 'DisplaySize']
  }
};

Editor.formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video'
];

export default Editor;

// OpenAI. (n.d.). ChatGPT (Version 3.5) [Computer software]. Retrieved June, 2024, from https://www.openai.com/chatgpt
// Prompt: "i have to make a website like outlook but basically add ai assistance for drafting emails. what can i use to create the interface for typing up emails?"
