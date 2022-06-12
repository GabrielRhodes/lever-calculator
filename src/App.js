import './App.css'
import React from 'react'
import { useState, useEffect, useCallback } from 'react'

function App() {
  const [friction, setFriction] = useState(false)
  const [balance, setBalance] = useState(2)
  const [question, setQuestion] = useState(0)
  const [image, setImage] = useState(0)
  const boardCoords = [
    [40, 52, 160, 52],
    [80, 52, 200, 52],
    [0, 52, 120, 52],
    [40, 32, 160, 72],
    [40, 72, 160, 32],
    [40, 12, 130, 72],
    [70, 72, 160, 12],
    [70, 44, 180, 72],
    [20, 72, 130, 44],
  ]

  useEffect(() => {
    setQuestion((q) => (q === 8 ? 0 : friction ? q + 4 : Math.max(q - 4, 0)))
  }, [friction])

  const getValues = useCallback(
    (pass = true) => {
      var elems = [
        document.getElementById('e-force'),
        document.getElementById('l-force'),
        document.getElementById('e-distance'),
        document.getElementById('l-distance'),
        document.getElementById('f-force'),
      ]
      let ignore =
        question > 3 ? (question === 8 ? question - 4 : question - 4) : question
      let vals = []
      for (let i = 0; i < elems.length; i++) {
        let val = parseFloat(elems[i]?.value)
        if (i === ignore && pass) {
          vals.push(NaN)
          continue
        }
        vals.push(val)
      }
      return vals
    },
    [question]
  )

  const imageValue = useCallback(
    (vals) => {
      if (balance === 2) {
        if (vals[2] / vals[3] <= 0.8) {
          return 1
        } else if (vals[2] / vals[3] >= 1.2) {
          return 2
        } else {
          return 0
        }
      } else if (balance === 0) {
        if (vals[2] / vals[3] <= 0.8) {
          return 7
        } else if (vals[2] / vals[3] >= 1.2) {
          return 5
        } else {
          return 3
        }
      } else if (balance === 1) {
        if (vals[2] / vals[3] <= 0.8) {
          return 6
        } else if (vals[2] / vals[3] >= 1.2) {
          return 8
        } else {
          return 4
        }
      }
      return 0
    },
    [balance]
  )

  const solve = useCallback(
    (vals) => {
      vals = vals.map((str) => parseFloat(str))
      let eBranch = vals[0] * vals[2]
      let lBranch = vals[1] * vals[3]
      switch (question) {
        case 0:
          return [Math.round((lBranch / vals[2]) * 100) / 100, 0]
        case 1:
          return [Math.round((eBranch / vals[3]) * 100) / 100, 1]
        case 2:
          return [Math.round((lBranch / vals[0]) * 100) / 100, 2]
        case 3:
          return [Math.round((eBranch / vals[1]) * 100) / 100, 3]
        case 4:
          return [Math.round(((lBranch + vals[4]) / vals[2]) * 100) / 100, 0]
        case 5:
          return [Math.round(((eBranch - vals[4]) / vals[3]) * 100) / 100, 1]
        case 6:
          return [Math.round(((lBranch + vals[4]) / vals[0]) * 100) / 100, 2]
        case 7:
          return [Math.round(((eBranch - vals[4]) / vals[1]) * 100) / 100, 3]
        case 8:
          return [Math.round((eBranch - lBranch) * 100) / 100, 4]
        default:
          return []
      }
    },
    [question]
  )

  const checkAns = useCallback(() => {
    var vals = getValues()
    var eff = document.getElementById('efficiency')
    var ima = document.getElementById('ima')
    var ans = solve(vals)
    var elem = document.getElementsByClassName('lever-input')[ans[1]]
    if (!elem) {
      return
    }
    if (vals.filter((x) => isNaN(x)).length > (friction ? 1 : 2)) {
      setImage(0)
      eff.innerHTML = 'η (Efficiency) = '
      ima.innerHTML = 'IMA (Ideal Mechanical Advantage) = '
      elem.value = ''
      return false
    } else {
      if (ans[0]) {
        if (friction) {
          elem.value = ans[0]
          vals = getValues(false)
          setImage(0)
          eff.innerHTML = `η (Efficiency) = ${Math.round(
            (vals[1] / vals[0] / (vals[2] / vals[3])) * 100
          )}%`
          ima.innerHTML = `IMA (Ideal Mechanical Advantage) = ${Math.round(
            (vals[2] / vals[3]) * 100
          ) / 100}`
        } else {
          eff.innerHTML = `η (Efficiency) = 100%`
          ima.innerHTML = `IMA (Ideal Mechanical Advantage) = ${Math.round(
            (vals[2] / vals[3]) * 100
          ) / 100}`
          switch (balance) {
            case 0:
              elem.value = `${ans[1] % 2 === 1 ? '>' : '<'} ${ans[0]}`
              break
            case 1:
              elem.value = `${ans[1] % 2 === 0 ? '>' : '<'} ${ans[0]}`
              break
            default:
              elem.value = ans[0]
              break
          }
          setImage(imageValue(getValues()))
        }
      }
    }
  }, [balance, friction, solve, getValues, imageValue])

  useEffect(() => {
    var elem = document.getElementsByClassName('lever-input')
    var disable =
      question > 3 ? (question === 8 ? question - 4 : question - 4) : question
    if (elem[disable] === undefined) {
      return
    }
    for (let i = 0; i < elem.length; i++) {
      elem[i].disabled = false
      elem[i].type = 'number'
    }
    elem[disable].type = ''
    elem[disable].disabled = true
    checkAns()
  }, [question, checkAns])

  useEffect(() => {
    checkAns()
  }, [balance, checkAns])

  return (
    <div>
      <div id='settings'>
        <div className='setting' id='friction-settings'>
          <p>Friction?</p>
          <button
            className={friction ? '' : 'selected'}
            onClick={() => setFriction(false)}
          >
            Frictionless
          </button>
          <button
            className={friction ? 'selected' : ''}
            onClick={() => setFriction(true)}
          >
            Friction
          </button>
        </div>
        <div className='setting' id='balance-settings'>
          <p>Blanced?</p>
          <button
            className={balance === 2 ? 'selected' : ''}
            onClick={() => setBalance(2)}
          >
            Balance
          </button>
          {friction ? null : (
            <>
              <button
                className={balance === 0 ? 'selected' : ''}
                onClick={() => setBalance(0)}
              >
                Effort {'<'} Load
              </button>
              <button
                className={balance === 1 ? 'selected' : ''}
                onClick={() => setBalance(1)}
              >
                Effort {'>'} Load
              </button>
            </>
          )}
        </div>
        <div className='setting' id='problem-settings'>
          <p>Solve For:</p>
          <button
            className={question === 0 || question === 4 ? 'selected' : ''}
            onClick={() => setQuestion(friction ? 4 : 0)}
          >
            Load Arm Length
          </button>
          <button
            className={question === 1 || question === 5 ? 'selected' : ''}
            onClick={() => setQuestion(friction ? 5 : 1)}
          >
            Load Force
          </button>
          <button
            className={question === 2 || question === 6 ? 'selected' : ''}
            onClick={() => setQuestion(friction ? 6 : 2)}
          >
            Effort Arm Length
          </button>
          <button
            className={question === 3 || question === 7 ? 'selected' : ''}
            onClick={() => setQuestion(friction ? 7 : 3)}
          >
            Effort Force
          </button>
          {friction ? (
            <button
              className={question === 8 ? 'selected' : ''}
              onClick={() => setQuestion(8)}
            >
              Frictional Force
            </button>
          ) : null}
        </div>
      </div>
      <div id='lever-problem'>
        <div id='lever-inputs'>
          <div className='lever-input-holder'>
            <label>
              F<sub>E</sub> (Effort Force in Newtons)
            </label>
            <input
              onChange={() => checkAns()}
              id='e-force'
              className='lever-input'
              type='number'
            />
          </div>
          <div className='lever-input-holder'>
            <label>
              F<sub>L</sub> (Load Force in Newtons)
            </label>
            <input
              onChange={() => checkAns()}
              id='l-force'
              className='lever-input'
              type='number'
            />
          </div>
          <div className='lever-input-holder'>
            <label>
              S<sub>E</sub> (Effort Distance in meters)
            </label>
            <input
              onChange={() => checkAns()}
              id='e-distance'
              className='lever-input'
              type='number'
            />
          </div>
          <div className='lever-input-holder'>
            <label>
              S<sub>L</sub> (Load Distance in meters)
            </label>
            <input
              onChange={() => checkAns()}
              id='l-distance'
              className='lever-input'
              type='number'
            />
          </div>
          <p id='efficiency'>η (Efficiency) = </p>
          <p id='ima'>IMA (Ideal Mechanical Advantage) = </p>
          {friction ? (
            <div className='lever-input-holder'>
              <label>
                τ<sub>f</sub> (Frictional Torque in Nm)
              </label>
              <input
                onChange={() => checkAns()}
                id='f-force'
                className='lever-input'
                type='number'
              />
            </div>
          ) : null}
        </div>
        <div id='lever-image'>
          <svg width='200px' height='74px'>
            <polygon
              points='110,72 90,72 100,52'
              strokeWidth='1px'
              stroke='black'
              fill='transparent'
            />
            <line
              x1={boardCoords[image][0]}
              y1={boardCoords[image][1]}
              x2={boardCoords[image][2]}
              y2={boardCoords[image][3]}
              stroke='black'
              strokeWidth='2px'
            ></line>
            <text className='reg-text' x='300' y='125' fill='black'>
              F
            </text>
            <text className='sub-text' x='517' y='218'>
              L
            </text>
            <text className='reg-text' x='195' y='131' fill='black'>
              τ
            </text>
            <text className='sub-text' x='337' y='228'>
              f
            </text>
            <text className='reg-text' x='100' y='125' fill='black'>
              F
            </text>
            <text className='sub-text' x='182' y='218'>
              E
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default App
