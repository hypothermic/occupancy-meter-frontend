import React, {useState, useEffect} from 'react'
import {Alert, Button, Col, FormControl, InputGroup, Row, Spinner, Table} from "react-bootstrap";
import {CameraVideo, HddNetwork, JustifyLeft} from "react-bootstrap-icons";
import {Redirect} from "react-router-dom";

/*
 * Een component waarin de gebruiker een nieuwe camera kan toevoegen
 */
const CameraCreateView = () => {

    /*
     * Naam van de camera (staat gelinked met het "Camera Naam" input veld
     */
    const [name,  setName]  = useState("")

    /*
     * IP van de VPS (staat gelinked met het "VPS IP" input veld
     */
    const [vpsIp, setVpsIp] = useState("")

    /*
     * IP van de camera (staat gelinked met het "Camera IP" input veld
     */
    const [camIp, setCamIp] = useState("")

    /*
     * Boolean of de pagina aan het laden is of niet
     */
    const [isSending, setIsSending] = useState(false)

    /*
     * Boolean of het toevoegen van de camera is voltooid
     */
    const [isDone,    setIsDone]    = useState(false)

    /*
     * null of String die aangeeft of er een error is opgetreden
     */
    const [error,     setError]     = useState(null)

    /*
     * Functie die met een POST request de data in JSON-formaat naar de server stuurt
     */
    const send = () => {
        setIsSending(true);

        // Stuur een HTTP POST met de data naar /camera/new
        fetch(`/camera/new`, {
            method: 'POST',
            headers: {
                // Accepteer een antwoord in JSON formaat
                'Accept': 'application/json',
                // Geef aan dat wij data in JSON formaat sturen
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    "name": name,
                    "vps_ip": vpsIp,
                    "cam_ip": camIp,
                }
            ),
        // Zodra we een antwoord krijgen:
        }).then(response => {
            setIsSending(false);

            // Check de HTTP status code van het antwoord
            switch (response.status) {
                // Aanmaken successvol
                case 201:
                    setIsDone(true);
                    break;
                // Camera bestaat al
                case 409:
                    setError("Er bestaat al een camera met de naam" + name);
                    break;
                // Andere fout
                default:
                    setError("Server error, kijk in de debugging tab van je browser welke error het is");
                    break;
            }
        })
    }

    /*
     * Input handler voor een form control
     */
    const handleChange = (setter) => (event) => {
        setter(event.target.value);
    }

    /*
     * Check of submit klaar is
     */
    if (isDone) {
        return <Redirect to="/camera/list"/>
    } else {
        return (
            <div>
                <Alert variant="danger" className={error ? "" : "d-none"}>
                    Fout: {error}
                </Alert>

                <Row>
                    <Col>
                        <h2>Camera toevoegen</h2>
                    </Col>
                </Row>

                <InputGroup className="my-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <JustifyLeft/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>

                    <FormControl
                        placeholder="Camera Naam"
                        aria-label="Camera Naam"
                        disabled={isSending}
                        value={name}
                        onChange={handleChange(setName)}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <CameraVideo/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>

                    <FormControl
                        placeholder="Camera IP"
                        aria-label="Camera IP"
                        disabled={isSending}
                        value={camIp}
                        onChange={handleChange(setCamIp)}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <HddNetwork/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>

                    <FormControl
                        placeholder="VPS IP"
                        aria-label="VPS IP"
                        disabled={isSending}
                        value={vpsIp}
                        onChange={handleChange(setVpsIp)}
                    />
                </InputGroup>

                <Button
                    variant="primary"
                    onClick={send}
                    disabled={isSending}
                >
                    Toevoegen
                </Button>
            </div>
        )
    }
}

export default CameraCreateView