import { useEffect, useState } from "react"
import SDK from "weavedb-sdk"
import { ethers } from "ethers"
import lf from "localforage"
import { isNil } from "ramda"

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
  const [user, setUser] = useState(null)

  const checkUser = async () => {
    const wallet_address = await lf.getItem(`temp_address:current`)
    if (!isNil(wallet_address)) {
      const identity = await lf.getItem(
        `temp_address:${contractTxId}:${wallet_address}`
      )
      if (!isNil(identity)) {
        setUser({
          wallet: wallet_address,
          privateKey: identity.privateKey,
        })
      }
    }
  }

  const setupWeaveDB = async () => {
    try {
      const _db = new SDK({
        contractTxId: contractTxId,
      })
      await _db.initializeWithoutWallet()
      setDb(_db)
      setInitDb(true)
    } catch (e) {
      console.error("setupWeaveDB", e)
    }
  }

  const login = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum, "any")
    const signer = await provider.getSigner()
    await provider.send("eth_requestAccounts", [])
    const wallet_address = await signer.getAddress()
    let identity = await lf.getItem(
      `temp_address:${contractTxId}:${wallet_address}`
    )

    let tx
    let err
    if (isNil(identity)) {
      ;({ tx, identity, err } = await db.createTempAddress(wallet_address))
      const linked = await db.getAddressLink(identity.address)
      if (isNil(linked)) {
        alert("something went wrong")
        return
      }
    } else {
      await lf.setItem("temp_address:current", wallet_address)

      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      })
      return
    }
    if (!isNil(tx) && isNil(tx.err)) {
      identity.tx = tx
      identity.linked_address = wallet_address
      await lf.setItem("temp_address:current", wallet_address)
      await lf.setItem(
        `temp_address:${contractTxId}:${wallet_address}`,
        JSON.parse(JSON.stringify(identity))
      )
      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      })
    }
  }

  const logout = async () => {
    await lf.removeItem("temp_address:current")
    setUser(null, "temp_current")
    console.log("<<logout()")
  }

  const handleLoginClick = async () => {
    try {
      login()
      console.log("<<handleLoginClick()")
    } catch (e) {
      console.error("handleLoginClick", e)
    }
  }

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
    checkUser()
    setupWeaveDB()
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
        <p>{initDb ? "WeaveDB is Ready" : "WeaveDB SDK is not initialized"}</p>
        {!isNil(user) ? (
          <button onClick={logout}>{user.wallet.slice(0, 8)}</button>
        ) : (
          <button onClick={handleLoginClick}>Connect Wallet</button>
        )}
        <br /> <br />
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
