import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import axios from 'axios';
import Tooltip from './tooltip/tooltip'; 

Quill.register('modules/imageResize', ImageResize);

class Editor extends Component {
  //
  constructor(props) {
    super(props);
    this.state = { 
      editorHtml: '', 
      suggestion: '', 
      tooltipPosition: { left: 0, top: 0 }, 
      typingTimeout: null 
    };
    this.handleChange = this.handleChange.bind(this);
    this.quillRef = React.createRef();
  }

  handleChange(html) {
    this.setState({ editorHtml: html });
    this.props.parentState({ emailContent: html });

    if (this.state.typingTimeout) {
      clearTimeout(this.state.typingTimeout);
    }

    const timeout = setTimeout(() => {
      this.fetchSuggestions(html);
    }, 3000); 

    this.setState({ typingTimeout: timeout });
  }

  async fetchSuggestions(content) {
    try {
      const response = await axios.post('http://localhost:5050/openai/suggestions', { content });
      const { data } = response;
      this.setState({ suggestion: data });

      const quill = this.quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        const bounds = quill.getBounds(range.index);
        const editorBounds = this.quillRef.current.getEditor().root.getBoundingClientRect();
        console.log("bounds", bounds)
        console.log("editorBounds", editorBounds)
        console.log("editorHeight", editorBounds.height)
        const top = bounds.top - editorBounds.height + 40;
        const left = bounds.left;
        this.setState({ tooltipPosition: { left, top } });
      }
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      this.setState({ suggestion: '' });
    }
  }

  insertSuggestion = () => {
    if (this.state.suggestion) {
      const quill = this.quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.clipboard.dangerouslyPasteHTML(range.index, this.state.suggestion);
        quill.setSelection(range.index + this.state.suggestion.length, 0);
      }
      this.setState({ editorHtml: quill.root.innerHTML, suggestion: '' });
    }
  };


  
  

  handleCloseTooltip = () => {
    this.setState({ suggestion: '' });
    this.quillRef.current.getEditor().focus();
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }
  
  handleWindowResize = () => {
    const { suggestion } = this.state;
    if (suggestion) {
      const quill = this.quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        const bounds = quill.getBounds(range.index);
        const editorBounds = this.quillRef.current.getEditor().root.getBoundingClientRect();
        const top = bounds.top - editorBounds.height + 40;
        const left = bounds.left;
        this.setState({ tooltipPosition: { left, top } });
      }
    }
  };
  

  render() {
    return (
      <div style={{ position: 'relative' }}>
        <ReactQuill
          ref={this.quillRef}
          theme="snow"
          onChange={this.handleChange}
          value={this.state.editorHtml}
          modules={Editor.modules}
          formats={Editor.formats}
          bounds={'#root'}
          placeholder={this.props.placeholder}
        />
        {this.state.suggestion && (
          <Tooltip
            suggestion={this.state.suggestion}
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
