import os

def main():
    print('hello')
    # cd to solr  folder\
    current_directory = os.getcwd()
    solr_directory = current_directory + r"\solr\solr-9.2.1\bin"
    os.system(solr_directory + "\solr.cmd start -p 9893")
    # start solr

    # cd to frontend folder
    # start website


if __name__ == "__main__":
    main()
