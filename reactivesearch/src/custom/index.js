import React, { Component } from 'react';
import AlgoPicker from ./AlgoPicker;

class MyAlgoPicker extends Component {
  render() {
    const {
      componentId,
      title,
    } = this.prop
  }

  return (
    <ReactiveComponent
      componentId={componentId}
    >
      <AlgoPicker title={title} id={componentId} />
    </ReactiveComponent>
  );
}

export default MyAlgoPicker;
