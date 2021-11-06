#!/bin/bash

#** Файл для переименования цепочки каталогв, что имеют файл соответствующий переменной TARGET_FILE_FOR_SEARCH
#** Необходимо для удобной навигации по Файловой системе - удобно видеть какие тесты упали. Так же с помощью этого маркера удается подкрасить каталоги на стороне ReacJS

export START_DIR_FOR_SEARCH='/opt/CODE/scripts/dogmat/'
#export START_DIR_FOR_SEARCH='/var/log/sikuli_tests/dogmat/'

#export TARGET_FILE_FOR_SEARCH='error_test.png'
#export NEW_FILE_NAME='error_test_log.png'

export TARGET_FILE_FOR_SEARCH='error_test.png'
export NEW_FILE_NAME='error_test_renamed.png'

export MRKER='_____error'

pathForTreat=''

function searchFile {
	pathForTreat=''
	list_offile=$(find ${START_DIR_FOR_SEARCH} -type f -name ${TARGET_FILE_FOR_SEARCH})
	#echo ${list_offile}
	if [[ ! -z $list_offile ]]
	then
		for path in ${list_offile}                                  #Сделал так, для выбора первого элемента. Как выборали, сразу вышли из цикла.
		do
			pathForTreat=${path}
			break
		done
		echo "=========> pathForTreat:"
		echo "${pathForTreat}"
	else
		pathForTreat=''
		echo 'Find Operation Didn`t find the target file'
	fi
}

#result=$( searchFile) #Это для return.
#Сделан именно такой подход (т.е. каждый раз новый поиск), так как в одной ветке может быть два файла, и переименовав ветку для одного файла, мы не сможем выполнить переименование для второго файла, так как родитель уже переименован и пути такого больше нет.
while :
do
	searchFile
	if [[ -z $pathForTreat ]]
	then
		echo "---------> The rename operation will not do. STOP!"
		break
	else
		echo "+++++++++> The rename operation will be done. START!"
	fi

	dirsWithOutFile=${pathForTreat//$TARGET_FILE_FOR_SEARCH}         #Убираем из найденного пути имя файла.
	mv ${pathForTreat} "${dirsWithOutFile}${NEW_FILE_NAME}"          #Переименовываем файл, чтоб далее уже в поиск не попадал.
	dirsWithOutStartFolder=${dirsWithOutFile//$START_DIR_FOR_SEARCH} #Убираем из найденного пути, стартовую часть. Необходимо, чтобы далее можно было разделить оствшуюся часть на составные части и бежать по ним переименовывая.
	readarray -d '/' -t strarr <<< "${dirsWithOutStartFolder}"       #Разбили на массив оставшуюся часть пути. #strarr=(${dirsWithOutStartFolder//\/ })
	k=${#strarr[*]}                                                  #Получили количество элементов в массиве. По хорошему для индексации по массиву нужно вычесть 1. Но здесь возвращается на один элемент больше. По этому вычитаем 2.
	for (( n=((k-2)) ; n >= 0 ; n--))
	do
		tmp="${strarr[n]}"
		tmpNew="${tmp}${MRKER}"                                      #Добавили маркер к каталогу.
		
		oldFullPath=$dirsWithOutFile
		dirsWithOutFile=${dirsWithOutFile//"$tmp/"}                  #Для формирования новой строки, удаляем старый каталог с хвоста
		newFullPath="$dirsWithOutFile${tmpNew}"                      #Добавляем новых наименование нового каталога

		if echo "$tmp" | grep ${MRKER};
		then
			echo '------Rename_Skiped------'
			continue
		fi
		echo "${oldFullPath}"
		echo "${newFullPath}"
		mv ${oldFullPath} ${newFullPath}
		echo '------Rename_Done------'
	done
	echo '------------------------------------------------------------------------------------------------------------------------'
done

#TODO: Почему-то последний каталог не переименовывает (нужно запускать повторно).... Хотя при первом прогоне меняет наименование файла.
