
grep "DEBUG: Scraped" $1.out | wc -l

echo "similarity 1:"
grep "'intersection': 1" $1.out | wc -l

echo "similarity 0.9:"
grep "'intersection': 0.9" $1.out | wc -l

echo "similarity 0.8:"
grep "'intersection': 0.8" $1.out | wc -l

echo "similarity 0.7:"
grep "'intersection': 0.7" $1.out | wc -l

echo "similarity 0.6:"
grep "'intersection': 0.6" $1.out | wc -l

echo "similarity 0.5:"
grep "'intersection': 0.5" $1.out | wc -l

echo "similarity 0.4:"
grep "'intersection': 0.4" $1.out | wc -l

echo "similarity 0.3:"
grep "'intersection': 0.3" $1.out | wc -l

echo "similarity 0.2:"
grep "'intersection': 0.2" $1.out | wc -l

echo "similarity 0.1:"
grep "'intersection': 0.1" $1.out | wc -l

echo "similarity 0.0:"
grep "'intersection': 0.0" $1.out | wc -l
