import os
def main():
    print('hello')
    # cd to solr  folder
    os.system('/solr/solr-9.2.1/bin/solr.cmd start -p 9893')
    # start solr

    # cd to frontend folder
    # start website


if __name__ == "__main__":
    main()
