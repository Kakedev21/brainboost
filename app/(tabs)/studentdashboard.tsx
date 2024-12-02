import React, { useEffect, useState, useRef } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView, Modal, Animated, TouchableWithoutFeedback, ViewStyle } from 'react-native'
import useAuthStore from '@/store/authStore'
import { getStudentQuizAttempts, getStudentModuleProgress, submitQuizAttempt } from '@/controller/studentController'
import { getQuizzes } from '@/controller/teacherQuiz'
import { getModules } from '@/controller/teacherModule'
import { Link, useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient'

const StudentDashBoard = () => {
  const { user, logout, userData } = useAuthStore()
  const [quizAttempts, setQuizAttempts] = useState<any[]>([])
  const [moduleProgress, setModuleProgress] = useState<any[]>([])
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<any>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [isFlipped, setIsFlipped] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const flipAnimation = useRef(new Animated.Value(0)).current

  console.log(user!.uid)

  const router = useRouter()

  useEffect(() => {
    if (user?.uid) {
      loadStudentData()
    }
  }, [user])

  const loadStudentData = async () => {
    try {
      const attempts = await getStudentQuizAttempts(user!.uid)
      setQuizAttempts(attempts)

      const progress = await getStudentModuleProgress(user!.uid)
      setModuleProgress(progress)

      const quizzes = await getQuizzes()
      const validQuizzes = quizzes.filter(quiz => quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0)
      setAvailableQuizzes(validQuizzes)

      const moduleData = await getModules()
      setModules(moduleData)
    } catch (error) {
      console.error('Error loading student data:', error)
    }
  }

  console.log(quizAttempts)

  const flipCard = () => {
    if (isFlipped) {
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsFlipped(false))
    } else {
      Animated.timing(flipAnimation, {
        toValue: 180,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsFlipped(true))
    }
  }

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg']
        })
      }
    ],
    backfaceVisibility: 'hidden' as const
  }

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg']
        })
      }
    ],
    backfaceVisibility: 'hidden' as const
  }

  const handleStartQuiz = (quiz: any) => {
    if (quiz.questions && quiz.questions.length > 0) {
      setCurrentQuiz(quiz)
      setCurrentQuestionIndex(0)
      setSelectedAnswers(new Array(quiz.questions.length).fill(''))
      setIsFlipped(false)
      flipAnimation.setValue(0)
    }
  }

  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answer
    setSelectedAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setIsFlipped(false)
      flipAnimation.setValue(0)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setIsFlipped(false)
      flipAnimation.setValue(0)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!currentQuiz || !currentQuiz.questions) return

    let score = 0
    currentQuiz.questions.forEach((question: any, index: number) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        score++
      }
    })

    const finalScore = (score / currentQuiz.questions.length) * 100

    const newAttempt = {
      studentId: user!.uid,
      quizId: currentQuiz.id,
      moduleId: currentQuiz.moduleId,
      answers: selectedAnswers.map((answer, index) => ({
        questionId: index.toString(),
        selectedAnswer: answer
      })),
      score: finalScore
    }

    try {
      await submitQuizAttempt(newAttempt)
      setCurrentQuiz(null)
      loadStudentData()
    } catch (error) {
      console.error('Error submitting quiz:', error)
    }
  }

  const handleModuleSelect = (module: any) => {
    setSelectedModule(module)
    setShowModuleModal(true)
  }

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  const flipCardContainer: ViewStyle = {
    width: '100%',
    height: 300, // Increased height to accommodate options
    marginVertical: 20,
  }

  const flipCardStyle: ViewStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    padding: 15,
    borderRadius: 10,
  }


  return (
    <LinearGradient
      colors={['#8B5CF6', '#3B82F6']}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.profileCircle} />
          <Text style={styles.studentName}>{userData?.fullName || 'Student'}</Text>
        </View>

        {currentQuiz && currentQuiz.questions ? (
          <View style={styles.quizContainer}>
            <Text style={styles.quizTitle}>{currentQuiz.title}</Text>
            <Text style={styles.questionText}>
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </Text>

            <View style={flipCardContainer}>
              <Animated.View
                style={[
                  flipCardStyle,
                  styles.flipCardFront,
                  frontAnimatedStyle,
                  { zIndex: isFlipped ? 0 : 1 }
                ]}
              >
                <Text style={styles.questionText}>
                  {currentQuiz.questions[currentQuestionIndex].question}
                </Text>
                <Pressable
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                  }}
                  onPress={flipCard}
                />
              </Animated.View>

              <Animated.View
                style={[
                  flipCardStyle,
                  styles.flipCardBack,
                  backAnimatedStyle,
                  { zIndex: isFlipped ? 1 : 0 }
                ]}
              >
                <ScrollView>
                  {currentQuiz.questions[currentQuestionIndex].options.map((option: string, index: number) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.optionButton,
                        selectedAnswers[currentQuestionIndex] === option && styles.selectedOption
                      ]}
                      onPress={() => handleSelectAnswer(option)}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </Animated.View>
            </View>

            <View style={styles.navigationButtons}>
              <Pressable
                style={styles.navButton}
                onPress={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <Text style={styles.buttonText}>Previous</Text>
              </Pressable>

              {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
                <Pressable style={styles.submitButton} onPress={handleSubmitQuiz}>
                  <Text style={styles.buttonText}>Submit Quiz</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.navButton} onPress={handleNextQuestion}>
                  <Text style={styles.buttonText}>Next</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Modules</Text>
              {modules.map((module, index) => (
                <Pressable
                  key={index}
                  style={styles.button}
                  onPress={() => handleModuleSelect(module)}
                >
                  <Text style={styles.buttonText}>{module.title}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Quizzes</Text>
              {availableQuizzes.map((quiz, index) => (
                <Pressable
                  key={index}
                  style={styles.button}
                  onPress={() => handleStartQuiz(quiz)}
                >
                  <Text style={styles.buttonText}>{quiz.title}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Progress</Text>
              {moduleProgress.map((progress, index) => (
                <View key={index} style={styles.progressItem}>
                  <Text style={styles.progressText}>
                    Module: {progress.moduleId}
                    {progress.completed ? ' (Completed)' : ' (In Progress)'}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              style={styles.button}
              onPress={() => setShowHistoryModal(true)}
            >
              <Text style={styles.buttonText}>View Quiz History</Text>
            </Pressable>

            <Modal
              animationType="slide"
              transparent={true}
              visible={showHistoryModal}
              onRequestClose={() => setShowHistoryModal(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Quiz History</Text>
                  <ScrollView>
                    {quizAttempts.map((attempt, index) => (
                      <View key={index} style={styles.attemptItem}>
                        <Text style={styles.progressText}>
                          Quiz: {attempt.quizId} - Score: {attempt.score}%
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setShowHistoryModal(false)}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={showModuleModal}
              onRequestClose={() => setShowModuleModal(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{selectedModule?.title}</Text>
                  <ScrollView>
                    <Text style={styles.moduleDescription}>{selectedModule?.description}</Text>
                    <Text style={styles.moduleContent}>{selectedModule?.content}</Text>
                  </ScrollView>
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setShowModuleModal(false)}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.buttonText}>LOGOUT</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  studentName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  attemptItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  progressText: {
    color: '#000',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  quizContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginBottom: 20,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  questionText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#fff',
  },
  flipCardContainer: {
    width: '100%',
    height: 300, // Increased height to accommodate options
    marginVertical: 20,
    position: 'relative',
  },
  flipCard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 15,
    borderRadius: 10,
    zIndex: 1,
  },
  flipCardFront: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  flipCardBack: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
    padding: 10,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: 'rgba(100, 200, 255, 0.3)',
  },
  optionText: {
    color: '#000',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: 'rgba(100, 200, 100, 0.3)',
    padding: 10,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  moduleDescription: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  moduleContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  }
})

export default StudentDashBoard