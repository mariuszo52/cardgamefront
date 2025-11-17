import React, {useState, useEffect} from "react";
import axios from "axios";

function CardManagement() {
    const [fractions, setFractions] = useState([])
    const [abilities, setAbilities] = useState([])
    const [fractionName, setFractionName] = useState("")
    const [selectedForm, setSelectedForm] = useState("CARD")
    const [franctionCost, setFranctionCost] = useState([])
    const [card, setCard] = useState({
        id: "",
        name: "",
        serialNumber: "",
        rarity: "COMMON",
        description: "",
        attack: "",
        abilitiesIds: [],
        cardType: "SPELL",
        fractionsCosts: []
    });

    function onAbilityChange(id) {
        let selectedAbilities = card.abilitiesIds;
        if (selectedAbilities.includes(id)) {
            selectedAbilities = selectedAbilities.filter(a => a !== id)
        } else {
            selectedAbilities.push(id)
        }
        setCard({...card, abilitiesIds: selectedAbilities})
        console.log(card.abilitiesIds)
    }

    useEffect(() => {
        function fetchAllFractions() {
            axios.get(process.env.REACT_APP_SERVER_URL + "/fractions")
                .then(response => setFractions(response.data))
                .catch(err => alert("Błąd podczas pobierania frakcji."))
        }

        fetchAllFractions()
    }, [selectedForm]);

    useEffect(() => {
        function fetchAllAbilities() {
            axios.get(process.env.REACT_APP_SERVER_URL + "/abilities")
                .then(response => setAbilities(response.data))
                .catch(err => alert("Błąd podczas pobierania umiejętności."))
        }

        fetchAllAbilities()
    }, [selectedForm]);

    const [imageFile, setImageFile] = useState(null);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setCard({...card, [name]: value});
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (card.fractionsCosts.length === 0) {
            alert("Dodaj przynajmniej jedną frakcję.")
            return
        }
        if (card.abilitiesIds.length === 0) {
            alert("Dodaj przynajmniej jedną umiejętność.")
            return
        }

        const formData = new FormData();
        for (const key in card) {
            formData.append(key, card[key]);
        }
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            const response = await axios.post(process.env.REACT_APP_SERVER_URL + "/card", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201) {
                alert("Dodano kartę.");
                setCard({
                    id: "",
                    name: "",
                    rarity: "COMMON",
                    fractions: [],
                    description: "",
                    attack: "",
                    abilitiesIds: [],
                    serialNumber: "",
                    cardType: "SPELL",
                    fractionsCosts: []
                });
                setImageFile(null);
                setFranctionCost([])
            } else {
                alert("Wystąpił błąd przy dodawaniu karty.");
            }
        } catch (error) {
            console.error("Błąd:", error);
            alert("Nie udało się połączyć z serwerem." + error.message);
        }
    };

    function handleFractionSubmit(event) {
        event.preventDefault();
        const params = {
            name: fractionName
        }
        axios.post(process.env.REACT_APP_SERVER_URL + "/fraction", null, {params: params})
            .then(response => {
                if (response.status === 201) {
                    alert("Dodano frakcję.");
                    setFractionName("")
                } else {
                    alert("Błąd podczas dodawaia frakcji.")
                }
            })
    }

    const [ability, setAbility] = useState({
        id: "",
        name: "",
        changeType: "MANA",
        changeValue: "",
        changeToValue: "",
        activeForTurns: "",
        isMeditation: false
    });

    const handleAbilityChange = (e) => {
        const {name, value} = e.target;
        setAbility({...ability, [name]: value});
    };

    const handleAbilitySubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(process.env.REACT_APP_SERVER_URL + "/ability", ability);
            if (response.status === 201 || response.status === 200) {
                alert("Dodano umiejętność!");
                setAbility({
                    id: "",
                    name: "",
                    changeType: "MANA",
                    changeValue: "",
                    changeToValue: "",
                    activeForTurns: "",
                    isMeditation: false
                });
            } else {
                alert("Wystąpił błąd przy dodawaniu umiejętności.");
            }
        } catch (error) {
            console.error(error);
            alert("Nie udało się połączyć z serwerem.");
        }
    };

    function onAddFractionClick() {
        const fraction = document.querySelector(".fractions_select")?.value;
        const cost = document.querySelector(".cost_input")?.value;
        if (franctionCost.map(fc => fc.fraction).includes(fraction)) {
            alert(`Dodano już frakcję ${fraction}`)
        } else {
            setFranctionCost([...franctionCost, {fractionName: fraction, cost: cost}]);
            setCard({
                ...card,
                fractionsCosts: JSON.stringify([...franctionCost, {fractionName: fraction, cost: cost}])
            });
        }
    }

    return (
        <div className={"main_div"}>
            <div className={"select_form_div"}>
                <button onClick={() => setSelectedForm("CARD")} value={"CARD"}>DODAJ KARTĘ</button>
                <button onClick={() => setSelectedForm("FRACTION")} value={"FRACTION"}>DODAJ FRAKCJĘ</button>
                <button onClick={() => setSelectedForm("ABILITY")} value={"ABILITY"}>DODAJ UMIEJĘTNOŚĆ</button>
            </div>
            {selectedForm === "FRACTION" ? (
                    <div className={"add_fraction"}>
                        <h2>Dodaj nową frakcję</h2>
                        <form onSubmit={handleFractionSubmit}>
                            <input name="name" placeholder="Nazwa" value={fractionName}
                                   onChange={event => setFractionName(event.target.value)} required/>
                            <button type="submit">DODAJ FRAKCJĘ</button>
                        </form>
                    </div>
                ) :
                selectedForm === "CARD" ? (
                        <div style={{padding: 20}}>
                            <h2>Dodaj nową kartę</h2>
                            <form onSubmit={handleSubmit} style={{display: "grid", gap: 10, maxWidth: 400}}>
                                <input name="id" placeholder="ID" value={card.id} onChange={handleChange} required/>
                                <input name="name" placeholder="Nazwa" value={card.name} onChange={handleChange} required/>
                                <input name="serialNumber" placeholder="Nr seryjny" value={card.serialNumber} onChange={handleChange} required/>
                                <label htmlFor={"rarity"}>Rzadkość</label>
                                <select name="rarity" value={card.rarity} onChange={handleChange}>
                                    <option value="COMMON">Zwykła</option>
                                    <option value="RARE">Rzadka</option>
                                    <option value="LEGENDARY">Legendarna</option>
                                </select>
                                <label>Rodzaj karty</label>
                                <select
                                    name="cardType"
                                    value={card.cardType}
                                    onChange={handleAbilityChange}
                                    required
                                >
                                    <option value="SPELL">Zaklęcie</option>
                                    <option value="MANA_SOURCE">Źródło many</option>
                                </select>
                                <label>Umiejętności</label>
                                <div className={"abilities_div"}>
                                    {abilities.map((ability, index) => (
                                        <div>
                                            <input onChange={() => onAbilityChange(ability.id)}
                                                   key={index} type={"checkbox"}/><label>{ability.name}</label>
                                        </div>
                                    ))}
                                </div>
                                <label>Wybierz frakcje</label>
                                <select className={"fractions_select"}>
                                    {fractions?.map((fraction, index) => (
                                        <option key={index} value={fraction.name}>{fraction.name}</option>
                                    ))}
                                </select>
                                <label>Koszt zagrania dla frakcji</label><input className={"cost_input"} type={"number"}
                                                                                defaultValue={1}/>
                                {franctionCost.length < 1 ? (
                                    <button type={"button"} onClick={onAddFractionClick}>Dodaj frakcję</button>
                                ) : (
                                    <button type={"button"} onClick={() => {
                                        setFranctionCost([])
                                        setCard({
                                            ...card,
                                            fractionsCosts: []
                                        });
                                    }
                                    }>Resetuj frakcje</button>
                                )}


                                <p>Wybrane frakcje: </p>

                                {franctionCost?.map((fc, index) => (
                                    <p key={index}>Frakcja: {fc.fraction} -> koszt: {fc.cost}</p>
                                ))}
                                <textarea name="description" placeholder="Opis" value={card.description}
                                          onChange={handleChange}
                                          required/>

                                <input min={0} name="attack" type="number" placeholder="Atak" value={card.attack}
                                       onChange={handleChange}
                                       required/>

                                <input type="file" accept="image/*" onChange={handleFileChange} required/>

                                <button type="submit">Dodaj kartę</button>
                            </form>
                        </div>
                    ) :
                    selectedForm === "ABILITY" ? (
                            <div style={{padding: 20, maxWidth: 400}}>
                                <h2>Dodaj nową umiejętność</h2>
                                <form onSubmit={handleAbilitySubmit} style={{display: "grid", gap: 10}}>
                                    <input
                                        name="name"
                                        placeholder="Nazwa"
                                        value={ability.name}
                                        onChange={handleAbilityChange}
                                        required
                                    />

                                    <label>Zmień typ</label>
                                    <select
                                        name="changeType"
                                        value={ability.changeType}
                                        onChange={handleAbilityChange}
                                        required
                                    >
                                        <option value="MANA">Mana</option>
                                        <option value="HEALTH">Zdrowie</option>
                                        <option value="ATTACK">Atak</option>
                                        <option value="PANCER">Pancerz</option>
                                    </select>

                                    <input
                                        type="number"
                                        name="changeValue"
                                        placeholder="Zmień wartość o (1-10)"
                                        value={ability.changeValue}
                                        min={1}
                                        max={10}
                                        onChange={handleAbilityChange}
                                    />

                                    <input
                                        type="number"
                                        name="changeToValue"
                                        placeholder="Zmień do wartości (0-100)"
                                        value={ability.changeToValue}
                                        min={0}
                                        max={100}
                                        onChange={handleAbilityChange}
                                    />
                                    <label>Aktywne przez ile tur</label>
                                    <input
                                        type="number"
                                        name="activeForTurns"
                                        placeholder="Aktywne przez ile tur"
                                        value={ability.activeForTurns}
                                        min={1}
                                        onChange={handleAbilityChange}
                                    />
                                    <label>Czy ma echo medytacji</label>
                                    <div className="radio_div">
                                        <span>Tak</span>
                                        <input
                                            type="radio"
                                            name="isMeditation"
                                            value="true"
                                            checked={ability.isMeditation === "true"}
                                            onChange={handleAbilityChange}
                                        />
                                        <span>Nie</span>
                                        <input
                                            type="radio"
                                            name="isMeditation"
                                            value="false"
                                            checked={ability.isMeditation === "false"}
                                            onChange={handleAbilityChange}
                                        />
                                    </div>

                                    <button type="submit">Dodaj Umiejętność</button>
                                </form>
                            </div>
                        )
                        :
                        null
            }
        </div>
    )
        ;
}

export default CardManagement;
