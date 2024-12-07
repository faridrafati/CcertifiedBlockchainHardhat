import React from "react";
import Web3 from "web3/dist/web3.min";
import { TextField, Button } from "@mui/material";
import { TASK_ABI, TASK_ADDRESS } from "./components/config/TaskConfig";
import Listing from "./Listing";
import resetProvider from "./resetProvider";
import HideShow from "./HideShow";

class Task extends resetProvider {
  state = {
    web3: new Web3(Web3.givenProvider || "http://localhost:8545"),
    network: "",
    account: "",
    Contract: "",
    isMetaMask: "",
    owner: "",
    tasks: [],
    inputs: {
      tasks: "",
      date: "",
    },
    status: "",
  };

  componentDidMount() {
    this.checkMetamask();
    this.tokenContractHandler();
  }

  tokenContractHandler = async () => {
    await this.initWeb();
    await this.initContract(TASK_ABI, TASK_ADDRESS);
    await this.extraInitContract();
  };

  extraInitContract = async () => {
    let { Contract, account } = this.state;
    let tasks = await Contract.methods.getMyTasks().call({ from: account });
    this.setState({ tasks });
  };
  
  inputHandler = (e) => {
    let { inputs } = this.state;
    inputs[e.currentTarget.id] = e.currentTarget.value;
    this.setState({ inputs });
  };

  addTasks = async (e) => {
    let TxId = "";
    let { inputs, Contract, account } = this.state;
    e.preventDefault();
    let task = {
      taskText: inputs.tasks + " @ " + inputs.date,
      isDeleted: false,
    };
    console.log(task.taskText);

    await Contract.methods
      .addTask(task.taskText, task.isDeleted)
      .send({ from: account, gas: "1000000" }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Adding Task is in Progress");
        } else {
          console.log(error);
          this.notify("error", "Adding Task Failed: " + error.message);
        }
      });
    await this.extraInitContract();
    this.notify("success", "Adding Task is Done: " + TxId);
  };

  deleteTask = async (taskId) => {
    let TxId = "";
    let { Contract, account } = this.state;
    await Contract.methods
      .deleteTask(taskId, true)
      .send({ from: account, gas: "1000000" }, (error, result) => {
        if (!error) {
          TxId = result;
          this.notify("info", "Deleting Task is in Progress");
        } else {
          console.log(error);
          this.notify("error", "Deleting Task is Failed: " + error.message);
        }
      });
    await this.extraInitContract();
    this.notify("success", "Deleting Task is Done: " + TxId);
  };



  render() {
    let { inputs, tasks } = this.state;

    return (
      <div className="container">
        <section className="bg-light text-center">
          <h1>Todo Manager</h1>
          <HideShow
            currentAccount={this.state.currentAccount}
            contractAddress={TASK_ADDRESS}
            chainId={this.state.chainId}
          />
        </section>
        <form>
          <TextField
            className="m-2"
            id="tasks"
            label="Make Todo"
            variant="outlined"
            style={{ margin: "0px 5px" }}
            size="small"
            value={inputs.tasks}
            onChange={this.inputHandler}
          />
          <TextField
            className="m-2"
            id="date"
            label="Date & Time"
            type="datetime-local"
            size="small"
            value={inputs.date}
            onChange={this.inputHandler}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            className="m-2"
            variant="contained"
            color="primary"
            onClick={this.addTasks}
          >
            Add Task
          </Button>
          <br />
          <br />
        </form>
        <ul>
          {tasks.map((task) => (
            <Listing
              key={task.id}
              taskText={task.taskText}
              onClick={() => this.deleteTask(task.id)}
            />
          ))}
        </ul>
      </div>
    );
  }
}

export default Task;
