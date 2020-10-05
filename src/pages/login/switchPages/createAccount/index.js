import axios from 'axios';
import React, { useReducer } from 'react';
import { useForm } from 'react-hook-form'
import { CreateArea } from './styles'
import LeftArrow from '../../../../assets/left-arrow.svg'

import {Link} from 'react-router-dom'

function SwitchPages() {

      const { register, handleSubmit } = useForm()

      const [userInput, setUserInput] = useReducer(
            (state, newState) => ({ ...state, ...newState }),
            {
                  email: '',
                  password: '',
                  passAgain: '',
            }
      );

      const handleChange = evt => {
            const name = evt.target.name;
            const newValue = evt.target.value;
            setUserInput({ [name]: newValue });
      }

      const createAccount = async (data) => {
			//axios.defaults.withCredentials = true
            if (userInput.password !== userInput.passAgain) {
                  alert('As senhas não conferem');
                  return false;
            }
			console.log(data)
			const settings = {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
				  'Accept': 'application/json',
				  'Content-Type': 'application/json',
				},
				credentials: 'include',
			  }

          try {
			//const response = await axios.post('http://tcspedroverani.herokuapp.com/user/create', data);
			const response = await fetch('http://tcspedroverani.herokuapp.com/user/create', settings);
			if (!response.ok) throw Error(response.message);
			const data = await response.json();
			if(data.auth) alert('Logou');
		  } catch (error) {
			  
		  }
      }

      return (
            <CreateArea>
                  <div className="header">
                        <div>
                        <Link to="/"><img src={LeftArrow} alt="" className='back-icon' /></Link>
                        </div>
                        <div className='div-title-header'>
                              <p className='title-header'>Criação de conta</p>
                        </div>
                  </div>

                  <form onSubmit={handleSubmit(createAccount)}>
                        <div>
                              <span>E-mail</span>
                              <input name='email' value={userInput.email} onChange={handleChange} ref={register({ required: true })} />
                        </div>
                        <div>
                              <span>Senha</span>
                              <input name='password' value={userInput.password} onChange={handleChange} ref={register({ required: true })} />
                        </div>
                        <div>

                              <span>Repita sua senha</span>
                              <input name='passAgain' value={userInput.passwordAgain} onChange={handleChange} ref={register({ required: true })} />
                        </div>
                        <button type='submit'>Criar</button>

                  </form>
            </CreateArea>
      )
}

export default SwitchPages;