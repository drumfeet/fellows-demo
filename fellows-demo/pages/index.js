import { useEffect, useState } from "react"
import SDK from "weavedb-sdk"

export default function Home() {
  const contractTxId = "SNencor4RYUP9CEqCXRTWPMSv8WPd4R9YjqhgtmSLtc"
  const COLLECTION_PEOPLE = "people"
  // State variables storing string values of name, age, and doc ID.
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [docId, setDocId] = useState("")
  // State variable storing an array of people data
  const [people, setPeople] = useState([])
  // State variable storing the weavedb-sdk object
  const [db, setDb] = useState(null)
  // State variable storing a boolean value indicating whether database initialization is complete.
  const [initDb, setInitDb] = useState(false)

  const handleAddClick = async () => {
    const _people = { name: name, age: age }

    try {
      const res = await db.add(_people, COLLECTION_PEOPLE)
      getPeople()
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSetClick = async () => {
    const _people = { name: name, age: age }

    try {
      const res = await db.set(_people, COLLECTION_PEOPLE, docId)
      getPeople()
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpsertClick = async () => {
    const _people = { name: name, age: age }

    try {
      const res = await db.upsert(_people, COLLECTION_PEOPLE, docId)
      getPeople()
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  }

  // Function to retrieve all people data from the database.
  const getPeople = async () => {
    try {
      const res = await db.cget(COLLECTION_PEOPLE)
      setPeople(res)
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  }

  // Effect hook to initialize the database object on component mount.
  useEffect(() => {
    ;(async () => {
      try {
        const _db = new SDK({
          contractTxId: contractTxId,
        })
        await _db.initializeWithoutWallet()
        setDb(_db)
        setInitDb(true)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  // Effect hook to retrieve people data from the database on database initialization.
  useEffect(() => {
    if (initDb) {
      getPeople()
    }
  }, [initDb])

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <label>Name</label>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <label>Age</label>
        <input
          placeholder="Age"
          value={age}
          type="number"
          onChange={(e) => setAge(e.target.value)}
        />
        <br /> <br />
        <button onClick={handleAddClick}>ADD</button>
        <br /> <br />
        <label>Document ID</label>
        <input
          placeholder="DocId"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
        />
        <br />
        <button onClick={handleSetClick}>SET</button>
        <br />
        <button onClick={handleUpsertClick}>UPSERT</button>
        <br /> <br />
        <table cellPadding="8px">
          <thead>
            <tr align="left">
              <th>Name</th>
              <th>Age</th>
              <th>DocId</th>
            </tr>
          </thead>
          <tbody>
            {people.map((item, index) => (
              <tr key={index}>
                <td>{item.data.name}</td>
                <td>{item.data.age}</td>
                <td>{item.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
