import React, { useEffect, useState } from 'react'
import { Text, View, Pressable, StyleSheet, Modal, TextInput, ScrollView } from 'react-native'
import useAuthStore from '@/store/authStore'
import { getModulesByTeacher, createModule } from '@/controller/teacherModule'
import { getQuizzesByModule, createQuiz } from '@/controller/teacherQuiz'
import { getAllQuizResults } from '@/controller/teacherController'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

const TeacherDashBoard = () => {
  const { user, logout, userData } = useAuthStore()
  const [modules, setModules] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')
  const [quizTitle, setQuizTitle] = useState('')
  const [quizResults, setQuizResults] = useState<any[]>([])
  const [questions, setQuestions] = useState([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  }])

  const router = useRouter()

  useEffect(() => {
    loadModules()
  }, [user])

  const loadModules = async () => {
    if (user?.uid) {
      try {
        const teacherModules = await getModulesByTeacher(user.uid)
        setModules(teacherModules)

        const allQuizzes = await Promise.all(
          teacherModules.map(module => module.id ? getQuizzesByModule(module.id) : [])
        )
        setQuizzes(allQuizzes.flat())
      } catch (error) {
        console.error('Error loading teacher data:', error)
      }
    }
  }

  const loadQuizResults = async () => {
    try {
      const results = await getAllQuizResults()
      setQuizResults(results)
      setShowResultsModal(true)
    } catch (error) {
      console.error('Error loading quiz results:', error)
    }
  }

  const handleCreateModule = async () => {
    if (!moduleTitle || !moduleDescription || !user?.uid) {
      console.log("sad")
      return
    }

    try {
      await createModule({
        title: moduleTitle,
        description: moduleDescription,
        teacherId: user.uid
      })
      setModuleTitle('')
      setModuleDescription('')
      setShowModuleModal(false)
      loadModules()
    } catch (error) {
      console.error('Error creating module:', error)
    }
  }

  const handleCreateQuiz = async () => {
    if (!quizTitle || !selectedModule || !user?.uid || !questions[0].question) return

    try {
      await createQuiz({
        title: quizTitle,
        moduleId: selectedModule,
        teacherId: user.uid,
        questions: questions
      })
      setQuizTitle('')
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: '' }])
      setShowQuizModal(false)
      loadModules()
    } catch (error) {
      console.error('Error creating quiz:', error)
    }
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    }])
  }

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const newQuestions = [...questions]
    if (field === 'question') {
      newQuestions[index].question = value
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.slice(-1)) - 1
      newQuestions[index].options[optionIndex] = value
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value
    }
    setQuestions(newQuestions)
  }

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  return (
    <LinearGradient
      colors={['#7F00FF', '#E100FF']}
      style={styles.container}
    >
      <Text style={styles.title}>BRAINBOOST CARD</Text>
      <View style={styles.header}>
        <View style={styles.profileCircle} />
        <Text style={styles.teacherName}>{userData?.fullName || 'Name of Teacher'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => setShowQuizModal(true)}>
          <Text style={styles.buttonText}>CREATE QUIZ</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => setShowModuleModal(true)}>
          <Text style={styles.buttonText}>CREATE MODULE</Text>
        </Pressable>
      </View>

      <Pressable style={styles.wideButton} onPress={loadQuizResults}>
        <Text style={styles.buttonText}>VIEW QUIZ RESULTS FOR STUDENTS</Text>
      </Pressable>

      <Pressable style={styles.wideButton}>
        <Text style={styles.buttonText}>NOTIFICATION PANEL</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>LOGOUT</Text>
      </Pressable>

      <Modal visible={showModuleModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Module</Text>
            <TextInput
              style={styles.input}
              placeholder="Module Title"
              value={moduleTitle}
              onChangeText={setModuleTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Module Description"
              value={moduleDescription}
              onChangeText={setModuleDescription}
              multiline
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButton} onPress={() => setShowModuleModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={handleCreateModule}>
                <Text style={styles.buttonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showQuizModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Quiz</Text>
            <TextInput
              style={styles.input}
              placeholder="Quiz Title"
              value={quizTitle}
              onChangeText={setQuizTitle}
            />
            <View style={styles.selectModule}>
              <Text style={styles.label}>Select Module:</Text>
              {modules.map((module) => (
                <Pressable
                  key={module.id}
                  style={[
                    styles.moduleOption,
                    selectedModule === module.id && styles.selectedModule
                  ]}
                  onPress={() => setSelectedModule(module.id)}
                >
                  <Text style={styles.buttonText}>{module.title}</Text>
                </Pressable>
              ))}
            </View>

            {questions.map((question, questionIndex) => (
              <View key={questionIndex} style={styles.questionContainer}>
                <Text style={styles.label}>Question {questionIndex + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter question"
                  value={question.question}
                  onChangeText={(value) => handleQuestionChange(questionIndex, 'question', value)}
                />

                {question.options.map((option, optionIndex) => (
                  <TextInput
                    key={optionIndex}
                    style={styles.input}
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChangeText={(value) => handleQuestionChange(questionIndex, `option${optionIndex + 1}`, value)}
                  />
                ))}

                <TextInput
                  style={styles.input}
                  placeholder="Correct Answer (Enter the option number 1-4)"
                  value={question.correctAnswer}
                  onChangeText={(value) => handleQuestionChange(questionIndex, 'correctAnswer', value)}
                  keyboardType="numeric"
                />
              </View>
            ))}

            <Pressable style={styles.addQuestionButton} onPress={handleAddQuestion}>
              <Text style={styles.buttonText}>Add Question</Text>
            </Pressable>

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButton} onPress={() => setShowQuizModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={handleCreateQuiz}>
                <Text style={styles.buttonText}>Create</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showResultsModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quiz Results</Text>
            {quizResults.map((result, index) => (
              <View key={index} style={styles.resultContainer}>
                <Text style={styles.resultText}>Student ID: {result.studentId}</Text>
                <Text style={styles.resultText}>Quiz ID: {result.quizId}</Text>
                <Text style={styles.resultText}>Score: {result.score}</Text>
                <Text style={styles.resultText}>Completed: {new Date(result.completedAt.seconds * 1000).toLocaleDateString()}</Text>
              </View>
            ))}
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowResultsModal(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 10,
  },
  teacherName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 20,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  wideButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: 'rgba(127, 0, 255, 0.3)',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  selectModule: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  moduleOption: {
    backgroundColor: 'rgba(127, 0, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedModule: {
    backgroundColor: 'rgba(127, 0, 255, 0.3)',
  },
  questionContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(127, 0, 255, 0.1)',
    borderRadius: 10,
  },
  addQuestionButton: {
    backgroundColor: 'rgba(127, 0, 255, 0.3)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  resultContainer: {
    backgroundColor: 'rgba(127, 0, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  }
})

export default TeacherDashBoard