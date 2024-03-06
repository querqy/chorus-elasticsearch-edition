import React, { Component } from 'react';
import Title from '../styles/Title';
import Container from '../styles/Container';
import {getClassName} from '@appbaseio/reactivecore/lib/utils/helper';

var UbiWriter = require('.././ts/UbiWriter.ts').UbiWriter;
var Ubi = require('.././ts/UbiEvent.ts');

//TODO: change name to something like ChoicePicker
class AlgoPicker extends Component {
  
  writer = null;
  state = {
    value: 'default',
    selectedValue: 'default',
  };



  onChangeValue = (event) => {
    this.setState({
      value: event.target.value,
      selectedValue: event.target.value,
    });
    const selection = event.target.value;

    console.log('SortPicker.onChange ' + selection);

    if('writer' in this.props){
      const writer = this.props['writer']
      const user_id = this.props['user_id'];
      const query_id = this.props['query_id'];
      const session_id = this.props['session_id'];
      let e = new Ubi.UbiEvent('product_sort', user_id, query_id);
      e.message = selection;
      e.message_type = 'SORT'
      e.event_attributes['session_id'] = session_id;
      e.event_attributes.data = new Ubi.UbiEventData('sort_event', 'fake object id', ''. event);
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
          <option checked={this.state.selectedValue === "sort_price"} value="sort_price">Sort by price</option>
          <option checked={this.state.selectedValue === "sort_ratings"} value="sort_ratings">Sort by ratings</option>
          <option checked={this.state.selectedValue === "sort_name"} value="sort_name">Sort by name</option>
        </select>
      </Container>
    )
  }
}

export default AlgoPicker;
