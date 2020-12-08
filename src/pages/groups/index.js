import React, { useReducer, useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { useAlert, types } from "react-alert";

import { Container, Created } from "./styles";

/* Components */
import Menu from "../../components/menu";

/* Animations */
import DoneAnimation from "./animations/index";

/* Icons */
import GroupImg from "../../assets/grouppageart.svg";
import LeftArrow from "../../assets/left-arrow.svg";
import groupcreatedlogo from "../../assets/groupcreatedlogo.png";

import { FaPlus, FaCrown, FaRegTrashAlt } from "react-icons/fa";
import { ImExit } from "react-icons/im";

const Groups = () => {
    const alert = useAlert();
    const { register, handleSubmit } = useForm();

    const [members, setMembers] = useState([]);

    const getGroup = async () => {
        const authorization = localStorage.getItem("qwert");
        const user = localStorage.getItem("user");

        document.addEventListener("keydown", (event) => {
            //nao enviar formulario quando apertar enter
            if (event.keyCode == 13) event.preventDefault();
        });

        const settings = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authorization,
            },
        };

        try {
            const response = await fetch(`https://cors-anywhere.herokuapp.com/tcspedroverani.herokuapp.com/group/view?user=${user}`, settings);
            const data = await response.json();
            return data;

            //Isso tem que ser executado assim que o usuário abrir a página de groups, se não vir nada é pq ele não ta em nenhum grupo.
            //Vai retornar dados do grupo, fazer um campo pro nome do grupo, descricao, participantes, e um botão pra sair do grupo.
            //Caso o usuário não tenha grupo, exibir um botão para ele criar um grupo.
            //Fazer uma breve descrição superior sobre o que é o grupo,(eu faço a descrição, só reserva o espaço);
        } catch (error) {}
    };

    const deleteGroup = async () => {
        const authorization = localStorage.getItem("qwert");
        const user = localStorage.getItem("user");
        const groupId = localStorage.getItem("groupId");

        const settings = {
            method: "DELETE",
            body: JSON.stringify({ groupId, user }),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authorization,
            },
        };
        try {
            const response = await fetch("https://cors-anywhere.herokuapp.com/tcspedroverani.herokuapp.com/group/delete", settings);
            const data = await response.json();
        } catch (error) {}
    };

    const leaveGroup = async () => {
        const authorization = localStorage.getItem("qwert");
        const user = localStorage.getItem("user");
        const groupId = localStorage.getItem("groupId");

        const settings = {
            method: "POST",
            body: JSON.stringify({ groupId, user }),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authorization,
            },
        };

        try {
            const response = await fetch("https://cors-anywhere.herokuapp.com/tcspedroverani.herokuapp.com/group/leaveGroup", settings);
            const data = await response.json();
        } catch (error) {}
    };

    const createGroup = async () => {
        const authorization = localStorage.getItem("qwert");
        const user = localStorage.getItem("user");

        const groupData = {
            groupDescription: userInput.groupDescription,
            groupName: userInput.groupName,
            groupParticipantsInvited: members,
            createdBy: user,
        };

        console.log(groupData);

        //pra criar grupo preciso dos dados
        //groupDescription = descricao do grupo ; groupName = nome do grupo;
        // groupParticipantsInvited = os emails separados por virgula que o cara quer convidar
        // createdBy = user do localStorage
        const payload = {
            createdBy: user,
            ...groupData,
        };
        const settings = {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authorization,
            },
        };
        try {
            const response = await fetch("https://cors-anywhere.herokuapp.com/tcspedroverani.herokuapp.com/group/create", settings);
            const data = await response.json();
            window.location.reload(true);
        } catch (error) {}

        //continuar metodo dps, lidar com a criacao, exibir os dados do grupo criado
        //ao criar grupo, já irá convidar todo mundo que o cara adicioncou
        //tem que ver o quão custoso é deixar o grupo editável.
    };

    const addEmailList = (email) => {
        if (members.length >= 9) {
            alert.show("você só pode cadastrar 10 pessoas");
            return false;
        }
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(String(email).toLowerCase()) === false) {
            alert.show("Você só pode adicionar e-mails");
            return false;
        }
        if (members.find((elem) => elem === email)) {
            alert.show("Já existe este email na lista.");
            return false;
        }
        setMembers([...members, email]);

        let ul = document.getElementById("list");
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(email));
        ul.appendChild(li);

        //setUserInput({ ["inputEmailMembers"]: "" });
    };

    const [userInput, setUserInput] = useReducer(
        //States da pagina
        (state, newState) => ({ ...state, ...newState }),
        {
            content: "",
            mode: "",
            groupName: "",
            groupDescription: "",
            createdAt: "",
            createdBy: "",
            groupParticipantsInvited: [],
            inputEmailMembers: "",
            user: "",
        }
    );

    const [groupParticipantsInvited, setGroupParticipantsInvited] = useState([]);

    useEffect(() => {
        (async () => {
            const data = await getGroup();

            if (data.message === "Usuário não está em nenhum grupo") {
                setUserInput({ ["mode"]: "nogroup" });
            } else {
                setUserInput({ ["mode"]: "created" });
                setUserInput({ ["groupName"]: data.group.groupName });
                setUserInput({ ["groupDescription"]: data.group.groupDescription });
                setUserInput({ ["createdAt"]: data.group.createdAt.match(/\d{4}-\d{2}-\d{2}/) });
                setUserInput({ ["createdBy"]: data.group.createdBy });
                setGroupParticipantsInvited(data.group.groupParticipantsInvited);
                localStorage.setItem("groupId", data.group.groupId);
            }
        })();

        document.addEventListener("keydown", (event) => {
            //Evita de mandar o formulario quando apertar enter e adiciona e-mail na lista mds.
            if (event.keyCode == 13) {
                if (!document.getElementById("button-add-email")) return;
                addEmailList(userInput.inputEmailMembers);
            }
        });

        const user = localStorage.getItem("user");
        setUserInput({ ["user"]: user });
    }, []);

    const handleChange = (evt) => {
        const name = evt.target.name;
        const newValue = evt.target.value;
        setUserInput({ [name]: newValue });
    };

    const changeMode = (mode) => {
        if (mode === "done") {
            setTimeout(function () {
                setUserInput({ ["mode"]: "nogroup" });
            }, 5000);
        }
        setUserInput({ ["mode"]: mode });
    };

    return (
        <>
            <Menu />

            <Container>
                {userInput.mode === "nogroup" && (
                    <>
                        <h1 className="description">Crie um grupo reuna seus amigos e familiares e mantenha todos informados sobre as fake news</h1>

                        <div className="divbutton">
                            <button id="create-group-button" onClick={() => changeMode("create")}>
                                <FaPlus className="icon" />
                            </button>
                            <div id="groupimage">
                                <img src={GroupImg} alt="" />
                                <h1 id="text-bottom-button">Crie ou configure agora mesmo</h1>
                            </div>
                        </div>
                    </>
                )}
                {userInput.mode === "create" && (
                    <>
                        <div id="back" onClick={() => changeMode("nogroup")}>
                            <img src={LeftArrow} alt="" />
                            <p>Voltar</p>
                        </div>
                        <h1 id="title-create-group">Configure seu grupo</h1>

                        <div id="create-group">
                            <form onSubmit={() => handleSubmit(createGroup())}>
                                <div id="div-form-create-group">
                                    <div id="div-group-name">
                                        <p>Nome do grupo</p>
                                        <input name="groupName" value={userInput.groupName} onChange={handleChange} ref={register({ required: true })}></input>
                                    </div>
                                    <div id="div-description-group">
                                        <p>Descrição do grupo</p>
                                        <textarea
                                            id="description-group"
                                            name="groupDescription"
                                            value={userInput.groupDescription}
                                            onChange={handleChange}
                                            ref={register({ required: true })}
                                        />
                                    </div>
                                    <div id="footer">
                                        <button
                                            type="submit"
                                            onClick={(event) => {
                                                changeMode("done");
                                                createGroup();
                                            }}
                                        >
                                            Salvar
                                        </button>
                                    </div>
                                </div>
                                <div id="div-list-emails">
                                    <h2>Adicione e-mails a lista do grupo</h2>
                                    <div id="div-list-emails-inside">
                                        <div>
                                            <input
                                                name="inputEmailMembers"
                                                type="email"
                                                id="input-email"
                                                value={userInput.inputEmailMembers}
                                                onChange={handleChange}
                                            />
                                            <button type="button" id="button-add-email" onClick={() => addEmailList(userInput.inputEmailMembers)}>
                                                <FaPlus />
                                            </button>
                                        </div>
                                        <ul id="list">
                                            <li>
                                                <FaCrown id="crown" />
                                                {userInput.user}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </>
                )}
                {userInput.mode === "done" && (
                    <>
                        <DoneAnimation />
                    </>
                )}
                {userInput.mode === "created" && (
                    <>
                        <Created>
                            <div id="cover">
                                <img src={groupcreatedlogo} alt="" />
                            </div>
                            <div id="content">
                                <div id="nav">
                                    {userInput.user === userInput.createdBy ? (
                                        <button onClick={() => deleteGroup()}>
                                            <FaRegTrashAlt size="25" color="red" />
                                        </button>
                                    ) : (
                                        <button>
                                            <ImExit onClick={() => leaveGroup()} size="25" color="red" />
                                        </button>
                                    )}
                                </div>
                                <div id="top">
                                    <h1 id="title">{userInput.groupName}</h1>
                                    <div id="description">
                                        <small id="description">{userInput.groupDescription}</small>
                                    </div>
                                </div>
                                <div id="mid">
                                    <h3 id="mid-title">Participantes</h3>
                                    {groupParticipantsInvited.map((elem) => (
                                        <span>{elem}</span>
                                    ))}
                                </div>

                                <div id="bottom">
                                    <small>Criado em: {userInput.createdAt}</small>
                                    <small>Criado por: {userInput.createdBy}</small>
                                </div>
                            </div>
                        </Created>
                    </>
                )}
            </Container>
        </>
    );
};

export default Groups;
