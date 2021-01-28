import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import db from '../db.json';
import Widget from '../src/components/Widget';
import QuizLogo from '../src/components/QuizLogo';
import QuizContainer from '../src/components/QuizContainer';
import QuizBackground from '../src/components/QuizBackground';
import AlternativeForm from '../src/components/AlternativeForm';
import Button from '../src/components/Button';
import GitHubCorner from '../src/components/GitHubCorner';

function upperLetter(nome){
    let firstName = nome.split(" ")[0];
    let letter = firstName.charAt(0);
    let afterLetter = letter.toUpperCase();
    let restName = firstName.substr(1, firstName.length);

    return afterLetter + restName;
}

function LoadingWidget(){
    return(
        <Widget>
            <Widget.Header>
                Carregando...
            </Widget.Header>

            <Widget.Content>
            <img
                alt="Descrição"
                style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                }}
                src='https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif'
            />
            </Widget.Content>
        </Widget>
    );
}

function ResultWidget({results}){
    const router = useRouter();
    
    const name = router.query.name;
    const firstName = upperLetter(name);

    return(
        <Widget>
            <Widget.Header>
                Resultado do Quiz
            </Widget.Header>
            <img
                alt="Descrição"
                style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                }}
                src='https://media.giphy.com/media/mmNd4nkgn75lu/giphy.gif'
            />
            <Widget.Content>
                <h3>{`Parabéns, ${firstName}!`}</h3>
                <p>
                    Você acertou 
                    {' '}
                    {/*{results.reduce((somatoriaAtual, resultAtual) => {
                        const isAcerto = resultAtual === true;
                        if (isAcerto) {
                        return somatoriaAtual + 1;
                        }
                        return somatoriaAtual;
                    }, 0)}*/}
                    {results.filter(x => x).length}
                    {' '}
                    perguntas
                </p>
                <ul>
                {results.map((result, index) => (
                    <li key={`result__${result}`}>
                    
                    {' Pergunta '}
                    {index + 1}
                    {': '}
                    {result === true
                        ? 'Acertou'
                        : 'Errou'}
                    </li>
                ))}
                </ul>
            </Widget.Content>
        </Widget>
    );
}

function QuestionWidget({question, totalQuestions, questionIndex, onSubmit, addResult}){
    const [selectedAlternative, setSelectedAlternative] = React.useState();
    const [isQuestionSubmited, setIsQuestionSubmited] = React.useState(false);
    const questionID = `question__${questionIndex}`;
    const isCorrect = selectedAlternative === question.answer;
    const hasAlternativeSelected = selectedAlternative !== undefined;

    return(
        <Widget>
            <Widget.Header>
                <h3>
                    {`Pergunta ${questionIndex + 1} de ${totalQuestions}`}
                </h3>
            </Widget.Header>
            <img
                alt="Descrição"
                style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                }}
                src={question.image}
            />
            <Widget.Content>
                <h2>
                    {question.title}
                </h2>
                <p>
                    {question.description}
                </p>

                {/* {JSON.stringify(questions, null, 4)} - Debug na tela */}
                <AlternativeForm onSubmit={(infoDoEvento) => {
                    infoDoEvento.preventDefault(); // Evita que a página inteira seja atualizada
                    setIsQuestionSubmited(true);
                    setTimeout(() => {
                        addResult(isCorrect);
                        onSubmit();
                        setIsQuestionSubmited(false);
                        setSelectedAlternative(undefined);
                    }, 2 * 1000);
                    
                }}>
                    {question.alternatives.map((alternative, alternativeIndex) =>{
                        const alternativeID = `alternative__${alternativeIndex}`;
                        const alternativeStatus = isCorrect ? 'SUCCESS' : 'ERROR';
                        const isSelected = selectedAlternative === alternativeIndex;
                        console.log("ID: " + alternativeIndex + " alternativa: " + alternative);
                        return (
                            <Widget.Topic
                                as="label" // Muda para a tag q irá ser renderizada na tela
                                key={alternativeID}
                                htmlFor={alternativeID}
                                data-selected={isSelected}
                                data-status={isQuestionSubmited && alternativeStatus}
                            >
                                <input style={{display: 'none'}} id={alternativeID} name={questionID} onChange={() => setSelectedAlternative(alternativeIndex)} type="radio"/>
                                
                                {alternative}
                            </Widget.Topic>
                        );
                    })}

                    <Button type="submit" disabled={!hasAlternativeSelected}>
                        Confirmar
                    </Button>

                    {isQuestionSubmited && isCorrect && <p>Voce acertou!</p>}
                    {isQuestionSubmited && !isCorrect && <p>Voce errou!</p>}
                </AlternativeForm>
            </Widget.Content>
        </Widget>

    );
}

const screenStates = {
    QUIZ: 'QUIZ',
    LOADING: 'LOADING',
    RESULT: 'RESULT'
};

export default function QuizPage(){
    const [screenState, setScreenState] = React.useState(screenStates.LOADING);
    const [results, setResults] = React.useState([]);
    const totalQuestions = db.questions.length;
    const [currentQuestion, setCurrentQuestion] = React.useState(0);
    const questionIndex = currentQuestion;
    const question = db.questions[questionIndex];   

    function addResult(result){
        setResults([...results, result]);
    }

    React.useEffect(() =>{
        setTimeout(() => {
            setScreenState(screenStates.QUIZ);
        }, 1 * 1000);
        // nasce === didMount
    }, []);
    
    function handleSubmitQuiz(){
        const nextQuestion = questionIndex + 1;
        if(nextQuestion < totalQuestions){
            setCurrentQuestion(nextQuestion);
        } else{
            setScreenState(screenStates.RESULT);
        }
    }

    return(
        <QuizBackground backgroundImage={db.bg}>
            <Head>
                <title>Quiz Avatar</title>
            </Head>
            <QuizContainer>
                <QuizLogo />
                {screenState === screenStates.QUIZ && (
                    <QuestionWidget 
                        question={question} 
                        questionIndex={questionIndex} 
                        totalQuestions={totalQuestions}
                        onSubmit={handleSubmitQuiz}
                        addResult={addResult}
                    />
                )}
                
                {screenState === screenStates.LOADING && <LoadingWidget/>}

                {screenState === screenStates.RESULT && <ResultWidget results={results} />}
            </QuizContainer>
            <GitHubCorner projectUrl="https://github.com/Alec-NK" />
        </QuizBackground>
    );
}