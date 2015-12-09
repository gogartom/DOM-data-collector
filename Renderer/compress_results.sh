set -e

echo "------- NUMBER OF LINES -------"
wc $1".txt"

echo "------- COMPRESSION --------"
zip -q -r "data/"$1".zip" $1"_log.txt" $1"_annotations" $1"_images" $1".txt"

echo "------- DELETE ORIGINAL FILES ---------"
rm -r $1"_log.txt" $1"_annotations" $1"_images" $1".txt"
