import React, { Component } from 'react';
import Title from '../styles/Title';
import Container from '../styles/Container';
import {getClassName} from '@appbaseio/reactivecore/lib/utils/helper';

var UbiWriter = require('.././ts/UbiWriter.ts').UbiWriter;
var Ubi = require('.././ts/UbiEvent.ts');

class AlgoPicker extends Component {
  
  writer = null;
  state = {
    algo: 'default',
    selectedValue: 'default',
  };



  onChangeValue = (event) => {
    this.setState({
      algo: event.target.value,
      selectedValue: event.target.value,
    });

    console.log('AlgorPicker.onChange ' + this.value);

    if('writer' in this.props){
      const writer = this.props['writer']
      let e = new Ubi.UbiEvent('algo_change', 'user123', '');
      e.message = 'Algorithm changed to ' + this.value
      writer.write_event(e);
    }
    else
      console.log('null writer');
  };

  render() {
    return (
      <Container style={this.props.style} className={this.props.className}>
				{this.props.title && (
					<Title className={getClassName(this.props.innerClass, 'title') || null}>
						{this.props.title}
					</Title>
				)}
        <select value={this.state.selectedValue} onChange={this.onChangeValue} style={{display: "flex", flexDirection: "column"}} id="algopicker">
          <option checked={this.state.selectedValue === "default"} value="default">Default</option>
          <option checked={this.state.selectedValue === "querqy_preview"} value="querqy_preview">Querqy Preview</option>
          <option checked={this.state.selectedValue === "querqy_live"} value="querqy_live">Querqy Live</option>
          <option checked={this.state.selectedValue === "querqy_boost_by_img_emb"} value="querqy_boost_by_img_emb">Querqy boost by image vector</option>
          <option checked={this.state.selectedValue === "querqy_match_by_img_emb"} value="querqy_match_by_img_emb">Querqy match by image vector</option>
          <option checked={this.state.selectedValue === "querqy_boost_by_txt_emb"} value="querqy_boost_by_txt_emb">Querqy boost by text vector</option>
          <option checked={this.state.selectedValue === "querqy_match_by_txt_emb"} value="querqy_match_by_txt_emb">Querqy match by text vector</option>
        </select>
      </Container>
    )
  }
}

export default AlgoPicker;
