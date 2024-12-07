import React, { Component } from 'react';
import Joi from "joi-browser";
import Input from "./components/pollCommon/input";
import Select from "./components/pollCommon/select";

class PollForm extends Component {
  state = {
    data: { 
      question: "", 
      image: "",
      option1:"",
      option2:"",
      option3:"",
    },
    errors: {}
  };

  schema = {
    question: Joi.string()
      .required()
      .label("Question"),
    image: Joi.string()
      .required()
      .label("Image"),
    option1: Joi.string()
      .required()
      .label("Option #1"),
    option2: Joi.string()
      .required()
      .label("Option #2"),
    option3: Joi.string()
      .label("Option #3")
  };


  validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  handleSubmit = e => {
    e.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    this.doSubmit();
  };

  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];

    const data = { ...this.state.data };
    data[input.name] = input.value;

    this.setState({ data, errors });
  };

  renderButton(label) {
    return (
      <div className='d-flex justify-content-center'>
        <button disabled = {this.validate()} className="btn btn-primary">
          {label}
        </button>
      </div>
    );
  }

  renderSelect(name, label, options) {
    const { data, errors } = this.state;

    return (
      <Select
        name={name}
        value={data[name]}
        label={label}
        options={options}
        onChange={this.handleChange}
        error={errors[name]}
      />
    );
  }

  renderInput(name, label, type = "text") {
    const { data, errors } = this.state;

    return (
          <Input
            type={type}
            name={name}
            value={data[name]}
            label={label}
            onChange={this.handleChange}
            error={errors[name]}
          />
    );
  }

  doSubmit = () => {
    this.props.submitCreatePollHandler(this.state.data);
  };

  render() {
    return (
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("question", "Question")}
          {this.renderInput("image", "Image")}
          {this.renderInput("option1", "Option #1")}
          {this.renderInput("option2", "Option #2")}
          {this.renderInput("option3", "Option #3")}
          {this.renderButton("Submit Poll")}
        </form>
    );
  }
}

export default PollForm;
