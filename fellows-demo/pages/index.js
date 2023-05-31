import { useEffect, useState } from "react"
import SDK from "weavedb-sdk"

export default function Home() {
  const contractTxId = "SNencor4RYUP9CEqCXRTWPMSv8WPd4R9YjqhgtmSLtc"
  const COLLECTION_PEOPLE = "people"
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [docId, setDocId] = useState("")
  const [people, setPeople] = useState([])

  const [db, setDb] = useState(null)
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

  const getPeople = async () => {
    try {
      const res = await db.cget(COLLECTION_PEOPLE)
      setPeople(res)
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  }

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

  useEffect(() => {
    if (initDb) {
      getPeople()
    }
  }, [initDb])

  return (
    <>
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
      <ul>
        {people.map((item, index) => (
          <li key={index}>
            {item.data.name} : {item.data.age}
          </li>
        ))}
      </ul>
    </>
  )
}
