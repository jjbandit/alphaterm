class CommandArea extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      cwdContents: []
    };
  }

  render () {
    return(
      <div>
        <p>{this.state.cwdContents}</p>
        <CommandLine />
      </div>
    );
  }

}
